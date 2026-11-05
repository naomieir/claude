import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';
import { Theme } from '@fluentui/react-components';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { SPFxHostType } from './SPFxHostType';
import { INewsFilter } from './INewsFilter';

export interface INewsFilterComponentProps {
  spfxContext: BaseComponentContext;
  value: INewsFilter;
  theme: Theme;
  hostType: SPFxHostType;
  onChange: (newValue: INewsFilter) => void;
}

export interface INewsFilterInternalProps
  extends IPropertyPaneCustomFieldProps,
    INewsFilterComponentProps {}
