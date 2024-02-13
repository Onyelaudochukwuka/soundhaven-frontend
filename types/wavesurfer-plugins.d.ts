// Inside wavesurfer-plugins.d.ts
import { WaveSurfer, PluginDefinition, RegionParams } from 'wavesurfer.js';

declare module 'wavesurfer.js' {
  interface WaveSurfer {
    addRegion(params: RegionParams): any; // Use the correct return type if available
    // Define other plugin methods as needed
  }
}

declare module 'wavesurfer.js/dist/plugins/regions.esm.js' {
  export interface RegionsPluginParams {
    [key: string]: any; // Specify plugin params here
  }

  export class RegionsPlugin {
    static create(params?: RegionsPluginParams): PluginDefinition;
    // Additional methods if needed
  }

  export default RegionsPlugin;
}
