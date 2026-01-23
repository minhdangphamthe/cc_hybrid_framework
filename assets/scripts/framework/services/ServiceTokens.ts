/** String tokens keep it simple across projects */
export const Services = {
  Assets: 'Assets',
  Audio: 'Audio',
  Input: 'Input',
  Save: 'Save',
  Network: 'Network',
  Ads: 'Ads',
  Analytics: 'Analytics',
  Push: 'Push',
  Time: 'Time',
} as const;

export type ServiceName = typeof Services[keyof typeof Services];
