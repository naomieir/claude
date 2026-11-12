import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ImageGalleryWebPartStrings';
import ImageGallery from './components/ImageGallery';
import { IImageGalleryProps } from './components/IImageGalleryProps';
import ConfigureWebPart from './components/ConfigureWebPart/ConfigureWebPart';
import { ListService } from '../../Services/ListService';

export interface IImageGalleryWebPartProps {
  imageLibrary: string;
  pageSize: number;
  autoScroll: boolean;
  scrollDirection: 'horizontal' | 'vertical';
  scrollSpeed: number;
  pauseOnHover: boolean;
  scrollAreaHeight: number;
  thumbnailWidth: number;
}

export default class ImageGalleryWebPart extends BaseClientSideWebPart<IImageGalleryWebPartProps> {
  private listService: ListService;

  protected async onInit(): Promise<void> {
    const _ = await super.onInit();

    this.listService = new ListService(this.context.spHttpClient);
  }

  public render(): void {
    // const element: React.ReactElement<IImageGalleryProps > = React.createElement(
    //   ImageGallery,
    //   {
    //     description: this.properties.imageLibrary
    //   }
    // );

    let element: any;

    if (this.properties.imageLibrary && this.properties.pageSize) {
      element = React.createElement<IImageGalleryProps>(
        ImageGallery,
        {
          listName: this.properties.imageLibrary,
          context: this.context,
          siteUrl: this.context.pageContext.web.absoluteUrl,
          pageSize: this.properties.pageSize,
          autoScroll: this.properties.autoScroll,
          scrollDirection: this.properties.scrollDirection,
          scrollSpeed: this.properties.scrollSpeed,
          pauseOnHover: this.properties.pauseOnHover,
          scrollAreaHeight: this.properties.scrollAreaHeight,
          thumbnailWidth: this.properties.thumbnailWidth
        }
      );
    }
    else {
      // show configure web part react component
      element = React.createElement(
        ConfigureWebPart,
        {
          webPartContext: this.context,
          title: "Image Gallery",
          description: strings.MissingListConfiguration,
          buttonText: strings.ConfigureWebpartButtonText
        }
      );
    }

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const vertical = this.properties.scrollDirection === 'vertical';

    return {
      pages: [
        {
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('imageLibrary', {
                  label: strings.ImageLibraryFieldLabel
                }),
                PropertyPaneSlider('pageSize', {
                  label: "Page Size",
                  min: 2,
                  max: 50,
                  value: 5,
                  showValue: true,
                  step: 1
                })
              ]
            },
            {
              groupName: strings.AutoScrollGroupName,
              groupFields: [
                PropertyPaneToggle('autoScroll', {
                  label: strings.AutoScrollFieldLabel,
                  onText: strings.OnText,
                  offText: strings.OffText
                }),
                PropertyPaneDropdown('scrollDirection', {
                  label: strings.ScrollDirectionFieldLabel,
                  selectedKey: vertical ? 'vertical' : 'horizontal',
                  options: [
                    { key: 'horizontal', text: strings.HorizontalOptionText },
                    { key: 'vertical', text: strings.VerticalOptionText }
                  ]
                }),
                PropertyPaneSlider('scrollSpeed', {
                  label: strings.ScrollSpeedFieldLabel,
                  min: 10,
                  max: 200,
                  step: 5,
                  value: this.properties.scrollSpeed || 40,
                  showValue: true
                }),
                PropertyPaneToggle('pauseOnHover', {
                  label: strings.PauseOnHoverFieldLabel,
                  checked: this.properties.pauseOnHover !== false,
                  onText: strings.OnText,
                  offText: strings.OffText
                }),
                PropertyPaneSlider('thumbnailWidth', {
                  label: strings.ThumbnailWidthFieldLabel,
                  min: 120,
                  max: 480,
                  step: 10,
                  value: this.properties.thumbnailWidth || 240,
                  showValue: true
                }),
                PropertyPaneSlider('scrollAreaHeight', {
                  label: strings.ScrollAreaHeightFieldLabel,
                  min: 200,
                  max: 1200,
                  step: 20,
                  value: this.properties.scrollAreaHeight || 500,
                  showValue: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
