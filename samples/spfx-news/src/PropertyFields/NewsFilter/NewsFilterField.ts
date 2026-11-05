import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
} from '@microsoft/sp-property-pane';
import { INewsFilterComponentProps, INewsFilterInternalProps } from '../../models/INewsFilterFieldProps';
import NewsFilterHost from './NewsFilterHost';

class PropertyPaneNewsFilterBuilder
  implements IPropertyPaneField<INewsFilterInternalProps>
{
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: INewsFilterInternalProps;

  constructor(targetProperty: string, properties: INewsFilterComponentProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      ...properties,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
      key: targetProperty,
    };
  }

  private onRender(elem: HTMLElement): void {
    ReactDOM.render(React.createElement(NewsFilterHost, this.properties), elem);
  }

  private onDispose(elem: HTMLElement): void {
    ReactDOM.unmountComponentAtNode(elem);
  }
}

export function PropertyPaneNewsFilter(
  targetProperty: string,
  properties: INewsFilterComponentProps,
): IPropertyPaneField<INewsFilterInternalProps> {
  return new PropertyPaneNewsFilterBuilder(targetProperty, properties);
}
