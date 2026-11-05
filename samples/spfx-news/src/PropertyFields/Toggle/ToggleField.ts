import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
} from '@microsoft/sp-property-pane';
import { IToggleComponentProps, IToggleInternalProps } from '../../models/IToggleProps';
import ToggleHost from './ToggleHost';

class PropertyPaneToggleSwitchBuilder
  implements IPropertyPaneField<IToggleInternalProps>
{
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IToggleInternalProps;

  constructor(targetProperty: string, properties: IToggleComponentProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      ...properties,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
      key: targetProperty,
    };
  }

  private onRender(elem: HTMLElement): void {
    ReactDOM.render(React.createElement(ToggleHost, this.properties), elem);
  }

  private onDispose(elem: HTMLElement): void {
    ReactDOM.unmountComponentAtNode(elem);
  }
}

export function PropertyPaneToggleSwitch(
  targetProperty: string,
  properties: IToggleComponentProps,
): IPropertyPaneField<IToggleInternalProps> {
  return new PropertyPaneToggleSwitchBuilder(targetProperty, properties);
}
