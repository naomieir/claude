import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Tag,
  TagGroup,
  tokens,
} from '@fluentui/react-components';
import { Icon } from '@iconify/react';
import {
  FluentUIProvider,
  IItemPickerOption,
  ItemPicker,
  StackV2,
  TypographyControl,
} from '@spteck/react-controls-v2';
import * as strings from 'NewsFeedWebPartStrings';
import { INewsFilterComponentProps } from '../../models/INewsFilterFieldProps';
import {
  DEFAULT_KEYWORD_MANAGED_PROPERTY,
  FilterMatchMode,
  INewsFilter,
  ISelectedNewsPost,
  MAX_SELECTED_POSTS,
  NewsSelectionMode,
} from '../../models/INewsFilter';
import { describeKeywordKql, isValidManagedProperty } from '../../utils/kqlBuilder';
import { searchNewsPosts } from '../../services/filteredNewsSearch';

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

const postToOption = (post: ISelectedNewsPost): IItemPickerOption => ({
  value: post.url,
  text: post.title,
  secondaryText: post.siteTitle,
});

const NewsFilterHost: React.FC<INewsFilterComponentProps> = ({ spfxContext, value, theme, onChange }) => {
  const [filter, setFilter] = useState<INewsFilter>(value);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [results, setResults] = useState<ISelectedNewsPost[]>([]);
  const searchCounter = useRef(0);

  const update = useCallback(
    (next: INewsFilter): void => {
      setFilter(next);
      onChange(next);
    },
    [onChange],
  );

  // ---- Enterprise keywords (automatic mode) ---------------------------------

  const addKeyword = (): void => {
    const keyword = keywordDraft.replace(/"/g, '').trim();
    setKeywordDraft('');
    if (!keyword) return;
    const exists = filter.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase());
    if (!exists) update({ ...filter, keywords: [...filter.keywords, keyword] });
  };

  const removeKeyword = (keyword: string): void =>
    update({ ...filter, keywords: filter.keywords.filter((k) => k !== keyword) });

  // ---- Selected posts -------------------------------------------------------

  const handleSearch = useCallback(
    (text: string): void => {
      const run = ++searchCounter.current;
      if (!text.trim()) {
        setResults([]);
        return;
      }
      searchNewsPosts(spfxContext, text)
        .then((found) => {
          // Ignore responses that arrive after a newer search started.
          if (run === searchCounter.current) setResults(found);
        })
        .catch(() => {
          if (run === searchCounter.current) setResults([]);
        });
    },
    [spfxContext],
  );

  const options = useMemo(() => results.map(postToOption), [results]);
  const selectedOptions = useMemo(() => filter.selectedPosts.map(postToOption), [filter.selectedPosts]);

  const handleSelectionChange = (selected: IItemPickerOption[]): void => {
    const known: Record<string, ISelectedNewsPost> = {};
    [...filter.selectedPosts, ...results].forEach((p) => {
      known[p.url] = p;
    });
    // Keep existing posts in their current order and append new ones at the end.
    const wanted = new Set(selected.map((o) => o.value));
    const kept = filter.selectedPosts.filter((p) => wanted.has(p.url));
    const added = selected
      .filter((o) => !kept.some((p) => p.url === o.value))
      .map((o) => known[o.value] ?? { url: o.value, title: o.text, siteTitle: o.secondaryText ?? '' });
    update({ ...filter, selectedPosts: [...kept, ...added].slice(0, MAX_SELECTED_POSTS) });
  };

  const movePost = (index: number, delta: number): void => {
    const target = index + delta;
    if (target < 0 || target >= filter.selectedPosts.length) return;
    const posts = [...filter.selectedPosts];
    const [moved] = posts.splice(index, 1);
    posts.splice(target, 0, moved);
    update({ ...filter, selectedPosts: posts });
  };

  const removePost = (url: string): void =>
    update({ ...filter, selectedPosts: filter.selectedPosts.filter((p) => p.url !== url) });

  const keywordPreview = describeKeywordKql(filter);

  return (
    <FluentUIProvider
      theme={theme}
      targetDocument={document}
      applicationName="newfeed-filter-property-pane"
      applyStylesToPortals
    >
      <StackV2 direction="vertical" gap="m" paddingTop="s">
        <RadioGroup
          layout="vertical"
          value={filter.mode}
          onChange={(_, data) => update({ ...filter, mode: data.value as NewsSelectionMode })}
        >
          <Radio value="auto" label={strings.NewsModeAutoLabel} />
          <Radio value="selected" label={strings.NewsModeSelectedLabel} />
        </RadioGroup>

        {filter.mode === 'auto' && (
          <StackV2 direction="vertical" gap="s">
            <TypographyControl fontSize="s" fontWeight="semibold" color={tokens.colorNeutralForeground1}>
              {strings.FilterKeywordsSectionLabel}
            </TypographyControl>
            <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground2}>
              {strings.FilterKeywordsDescriptionLabel}
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
              <RadioGroup
                layout="horizontal"
                value={filter.keywordMatch}
                onChange={(_, data) => update({ ...filter, keywordMatch: data.value as FilterMatchMode })}
              >
                <Radio value="any" label={strings.FilterMatchAnyLabel} />
                <Radio value="all" label={strings.FilterMatchAllLabel} />
              </RadioGroup>
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
            {keywordPreview && (
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
                  {keywordPreview}
                </code>
              </StackV2>
            )}
          </StackV2>
        )}

        {filter.mode === 'selected' && (
          <StackV2 direction="vertical" gap="s">
            <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground2}>
              {strings.SelectedPostsDescriptionLabel}
            </TypographyControl>
            <ItemPicker
              options={options}
              selectedOptions={selectedOptions}
              placeholder={strings.SelectedPostsSearchPlaceholder}
              noResultsMessage={strings.SelectedPostsNoResultsLabel}
              maxSelectedOptions={MAX_SELECTED_POSTS}
              width="100%"
              onSearchChange={handleSearch}
              onSelectionChange={handleSelectionChange}
            />
            {filter.selectedPosts.length > 1 && (
              <StackV2 direction="vertical" gap="xs">
                <TypographyControl fontSize="xs" fontWeight="semibold" color={tokens.colorNeutralForeground1}>
                  {strings.SelectedPostsOrderLabel}
                </TypographyControl>
                {filter.selectedPosts.map((post, index) => (
                  <StackV2 key={post.url} direction="horizontal" gap="xs" alignItems="center">
                    <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground2}>
                      {index + 1}.
                    </TypographyControl>
                    <div style={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={post.title}>
                      <TypographyControl fontSize="xs" color={tokens.colorNeutralForeground1}>
                        {post.title}
                      </TypographyControl>
                    </div>
                    <Button
                      size="small"
                      appearance="subtle"
                      aria-label={`${strings.SelectedPostsMoveUpLabel}: ${post.title}`}
                      title={strings.SelectedPostsMoveUpLabel}
                      icon={<Icon icon="fluent:arrow-up-20-regular" />}
                      disabled={index === 0}
                      onClick={() => movePost(index, -1)}
                    />
                    <Button
                      size="small"
                      appearance="subtle"
                      aria-label={`${strings.SelectedPostsMoveDownLabel}: ${post.title}`}
                      title={strings.SelectedPostsMoveDownLabel}
                      icon={<Icon icon="fluent:arrow-down-20-regular" />}
                      disabled={index === filter.selectedPosts.length - 1}
                      onClick={() => movePost(index, 1)}
                    />
                    <Button
                      size="small"
                      appearance="subtle"
                      aria-label={`${strings.FilterRemoveLabel}: ${post.title}`}
                      title={strings.FilterRemoveLabel}
                      icon={<Icon icon="fluent:dismiss-20-regular" />}
                      onClick={() => removePost(post.url)}
                    />
                  </StackV2>
                ))}
              </StackV2>
            )}
          </StackV2>
        )}
      </StackV2>
    </FluentUIProvider>
  );
};

export default NewsFilterHost;
