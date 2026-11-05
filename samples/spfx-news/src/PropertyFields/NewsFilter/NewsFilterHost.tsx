import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Option,
  Radio,
  RadioGroup,
  Spinner,
  Tag,
  TagGroup,
  tokens,
} from '@fluentui/react-components';
import { Icon } from '@iconify/react';
import { FluentUIProvider, StackV2, TypographyControl } from '@spteck/react-controls-v2';
import * as strings from 'NewsFeedWebPartStrings';
import { INewsFilterComponentProps } from '../../models/INewsFilterFieldProps';
import {
  DEFAULT_KEYWORD_MANAGED_PROPERTY,
  FilterMatchMode,
  IFilterableColumn,
  INewsFilter,
  IPagePropertyFilter,
  PagePropertyOperator,
} from '../../models/INewsFilter';
import { describeNewsFilterKql, isValidManagedProperty, toFilterableColumns } from '../../utils/kqlBuilder';
import { getSitePagesColumns } from '../../services/filteredNewsSearch';

const CUSTOM_PROPERTY_KEY = '__custom__';

const newId = (): string => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Text input that reports its value only on blur or Enter. */
const CommitInput: React.FC<{
  value: string;
  placeholder: string;
  ariaLabel: string;
  invalid?: boolean;
  onCommit: (value: string) => void;
}> = ({ value, placeholder, ariaLabel, invalid, onCommit }) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = (): void => {
    if (draft !== value) onCommit(draft);
  };
  return (
    <Input
      size="small"
      value={draft}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={invalid}
      style={invalid ? { borderColor: tokens.colorPaletteRedBorder2 } : undefined}
      onChange={(_, data) => setDraft(data.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
    />
  );
};

const MatchModeChoice: React.FC<{
  value: FilterMatchMode;
  onChange: (value: FilterMatchMode) => void;
}> = ({ value, onChange }) => (
  <RadioGroup
    layout="horizontal"
    value={value}
    onChange={(_, data) => onChange(data.value as FilterMatchMode)}
  >
    <Radio value="any" label={strings.FilterMatchAnyLabel} />
    <Radio value="all" label={strings.FilterMatchAllLabel} />
  </RadioGroup>
);

const OPERATOR_LABELS: Record<PagePropertyOperator, string> = {
  is: strings.FilterOperatorIsLabel,
  equals: strings.FilterOperatorEqualsLabel,
  isNot: strings.FilterOperatorIsNotLabel,
};

const NewsFilterHost: React.FC<INewsFilterComponentProps> = ({ spfxContext, value, theme, onChange }) => {
  const [filter, setFilter] = useState<INewsFilter>(value);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [columns, setColumns] = useState<IFilterableColumn[]>([]);
  const [columnsState, setColumnsState] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    getSitePagesColumns(spfxContext)
      .then((fields) => {
        if (cancelled) return;
        setColumns(toFilterableColumns(fields));
        setColumnsState('loaded');
      })
      .catch(() => {
        if (!cancelled) setColumnsState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [spfxContext]);

  const update = useCallback(
    (next: INewsFilter): void => {
      setFilter(next);
      onChange(next);
    },
    [onChange],
  );

  // ---- Enterprise keywords -------------------------------------------------

  const addKeyword = (): void => {
    const keyword = keywordDraft.replace(/"/g, '').trim();
    setKeywordDraft('');
    if (!keyword) return;
    const exists = filter.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase());
    if (!exists) update({ ...filter, keywords: [...filter.keywords, keyword] });
  };

  const removeKeyword = (keyword: string): void =>
    update({ ...filter, keywords: filter.keywords.filter((k) => k !== keyword) });

  // ---- Page properties -----------------------------------------------------

  const updateRow = (id: string, patch: Partial<IPagePropertyFilter>): void =>
    update({
      ...filter,
      pageProperties: filter.pageProperties.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });

  const removeRow = (id: string): void =>
    update({ ...filter, pageProperties: filter.pageProperties.filter((r) => r.id !== id) });

  const addRow = (): void => {
    const first = columns[0];
    update({
      ...filter,
      pageProperties: [
        ...filter.pageProperties,
        {
          id: newId(),
          fieldTitle: first ? first.title : '',
          managedProperty: first ? first.managedProperty : '',
          operator: 'is',
          value: '',
        },
      ],
    });
  };

  const columnByProperty = useMemo(() => {
    const map: Record<string, IFilterableColumn> = {};
    columns.forEach((c) => {
      map[c.managedProperty] = c;
    });
    return map;
  }, [columns]);

  const positivePropertyCount = filter.pageProperties.filter((r) => r.operator !== 'isNot').length;
  const preview = describeNewsFilterKql(filter);

  return (
    <FluentUIProvider theme={theme} targetDocument={document} applicationName="newfeed-filter-property-pane">
      <StackV2 direction="vertical" gap="m" paddingTop="s">
        <TypographyControl fontSize="s" color={tokens.colorNeutralForeground2}>
          {strings.FilterDescriptionLabel}
        </TypographyControl>

        {/* Enterprise keywords */}
        <StackV2 direction="vertical" gap="s">
          <TypographyControl fontSize="s" fontWeight="semibold" color={tokens.colorNeutralForeground1}>
            {strings.FilterKeywordsSectionLabel}
          </TypographyControl>
          <StackV2 direction="horizontal" gap="s" alignItems="center">
            <Input
              size="small"
              style={{ flexGrow: 1 }}
              value={keywordDraft}
              placeholder={strings.FilterKeywordPlaceholder}
              aria-label={strings.FilterKeywordsSectionLabel}
              onChange={(_, data) => setKeywordDraft(data.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addKeyword();
              }}
            />
            <Button size="small" onClick={addKeyword} disabled={!keywordDraft.trim()}>
              {strings.FilterAddLabel}
            </Button>
          </StackV2>
          {filter.keywords.length > 0 && (
            <TagGroup
              size="small"
              aria-label={strings.FilterKeywordsSectionLabel}
              onDismiss={(_, data) => removeKeyword(String(data.value))}
              style={{ flexWrap: 'wrap', gap: 4 }}
            >
              {filter.keywords.map((k) => (
                <Tag key={k} value={k} dismissible dismissIcon={{ 'aria-label': `${strings.FilterRemoveLabel} ${k}` }}>
                  {k}
                </Tag>
              ))}
            </TagGroup>
          )}
          {filter.keywords.length > 1 && (
            <MatchModeChoice value={filter.keywordMatch} onChange={(m) => update({ ...filter, keywordMatch: m })} />
          )}
          <StackV2 direction="vertical" gap="xs">
            <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground2}>
              {strings.FilterKeywordPropertyLabel}
            </TypographyControl>
            <CommitInput
              value={filter.keywordManagedProperty}
              placeholder={DEFAULT_KEYWORD_MANAGED_PROPERTY}
              ariaLabel={strings.FilterKeywordPropertyLabel}
              invalid={!isValidManagedProperty(filter.keywordManagedProperty)}
              onCommit={(v) =>
                update({ ...filter, keywordManagedProperty: v.trim() || DEFAULT_KEYWORD_MANAGED_PROPERTY })
              }
            />
          </StackV2>
        </StackV2>

        {/* Page properties */}
        <StackV2 direction="vertical" gap="s">
          <TypographyControl fontSize="s" fontWeight="semibold" color={tokens.colorNeutralForeground1}>
            {strings.FilterPagePropertiesSectionLabel}
          </TypographyControl>
          {columnsState === 'loading' && <Spinner size="tiny" />}
          {columnsState === 'error' && (
            <TypographyControl fontSize="xs" color={tokens.colorPaletteRedForeground1}>
              {strings.FilterColumnsErrorLabel}
            </TypographyControl>
          )}
          {columnsState === 'loaded' && columns.length === 0 && (
            <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground2}>
              {strings.FilterNoColumnsLabel}
            </TypographyControl>
          )}

          {filter.pageProperties.map((row) => {
            const knownColumn = columnByProperty[row.managedProperty];
            const selectedKey = knownColumn ? row.managedProperty : CUSTOM_PROPERTY_KEY;
            return (
              <StackV2
                key={row.id}
                direction="vertical"
                gap="xs"
                padding="s"
                style={{ border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium }}
              >
                <Dropdown
                  size="small"
                  aria-label={strings.FilterPropertyLabel}
                  value={knownColumn ? knownColumn.title : strings.FilterCustomPropertyOption}
                  selectedOptions={[selectedKey]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue === CUSTOM_PROPERTY_KEY) {
                      updateRow(row.id, { fieldTitle: '', managedProperty: knownColumn ? '' : row.managedProperty });
                    } else {
                      const col = columnByProperty[data.optionValue as string];
                      if (col) updateRow(row.id, { fieldTitle: col.title, managedProperty: col.managedProperty });
                    }
                  }}
                >
                  {columns.map((c) => (
                    <Option key={c.managedProperty} value={c.managedProperty} text={c.title}>
                      {c.title}
                    </Option>
                  ))}
                  <Option value={CUSTOM_PROPERTY_KEY} text={strings.FilterCustomPropertyOption}>
                    {strings.FilterCustomPropertyOption}
                  </Option>
                </Dropdown>
                {!knownColumn && (
                  <CommitInput
                    value={row.managedProperty}
                    placeholder={strings.FilterManagedPropertyPlaceholder}
                    ariaLabel={strings.FilterManagedPropertyPlaceholder}
                    invalid={!!row.managedProperty && !isValidManagedProperty(row.managedProperty)}
                    onCommit={(v) => updateRow(row.id, { managedProperty: v.trim() })}
                  />
                )}
                <StackV2 direction="horizontal" gap="s" alignItems="center">
                  <Dropdown
                    size="small"
                    style={{ minWidth: 0, width: 120 }}
                    aria-label={strings.FilterOperatorLabel}
                    value={OPERATOR_LABELS[row.operator]}
                    selectedOptions={[row.operator]}
                    onOptionSelect={(_, data) =>
                      updateRow(row.id, { operator: data.optionValue as PagePropertyOperator })
                    }
                  >
                    {(Object.keys(OPERATOR_LABELS) as PagePropertyOperator[]).map((op) => (
                      <Option key={op} value={op} text={OPERATOR_LABELS[op]}>
                        {OPERATOR_LABELS[op]}
                      </Option>
                    ))}
                  </Dropdown>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <CommitInput
                      value={row.value}
                      placeholder={strings.FilterValuePlaceholder}
                      ariaLabel={strings.FilterValuePlaceholder}
                      onCommit={(v) => updateRow(row.id, { value: v })}
                    />
                  </div>
                  <Button
                    size="small"
                    appearance="subtle"
                    aria-label={strings.FilterRemoveLabel}
                    title={strings.FilterRemoveLabel}
                    icon={<Icon icon="fluent:delete-20-regular" />}
                    onClick={() => removeRow(row.id)}
                  />
                </StackV2>
              </StackV2>
            );
          })}

          {positivePropertyCount > 1 && (
            <MatchModeChoice value={filter.propertyMatch} onChange={(m) => update({ ...filter, propertyMatch: m })} />
          )}
          <Button
            size="small"
            appearance="secondary"
            icon={<Icon icon="fluent:add-20-regular" />}
            onClick={addRow}
            disabled={columnsState === 'loading'}
          >
            {strings.FilterAddPagePropertyLabel}
          </Button>
        </StackV2>

        {/* Generated condition */}
        {preview && (
          <StackV2 direction="vertical" gap="xs">
            <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground2}>
              {strings.FilterPreviewLabel}
            </TypographyControl>
            <code
              style={{
                fontSize: 11,
                wordBreak: 'break-all',
                padding: 6,
                borderRadius: tokens.borderRadiusMedium,
                background: tokens.colorNeutralBackground3,
                color: tokens.colorNeutralForeground1,
              }}
            >
              {preview}
            </code>
            <Button
              size="small"
              appearance="subtle"
              onClick={() =>
                update({ ...filter, keywords: [], pageProperties: [] })
              }
            >
              {strings.FilterClearLabel}
            </Button>
          </StackV2>
        )}
      </StackV2>
    </FluentUIProvider>
  );
};

export default NewsFilterHost;
