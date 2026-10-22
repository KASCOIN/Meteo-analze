import React from 'react';
import { MeteoWidget } from '../src/widgets/MeteoWidget';

export async function widgetTaskHandler(props) {
  const widgetInfo = props?.widgetAction || props;
  const isWidgetAction = widgetInfo?.widgetAction === 'WIDGET_ADDED' || widgetInfo?.widgetAction === 'WIDGET_UPDATE';

  if (isWidgetAction && typeof props?.renderWidget === 'function') {
    props.renderWidget(<MeteoWidget locationName="My Location" temperature="--" condition="Clear" updatedAt="Now" />);
  }
}
