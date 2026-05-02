// Type augmentation for react-native-maps
// Ensures TypeScript recognizes the module
declare module 'react-native-maps' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface LatLng {
    latitude: number;
    longitude: number;
  }

  export const PROVIDER_GOOGLE: string;
  export const PROVIDER_DEFAULT: string;

  export default class MapView extends Component<any> {}
  export class Marker extends Component<any> {}
  export class Callout extends Component<any> {}
  export class Polyline extends Component<any> {}
  export class Polygon extends Component<any> {}
  export class Circle extends Component<any> {}
}
