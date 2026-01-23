/** String tokens keep it simple across projects */
export const Services = {
  EventBus: 'EventBus',
  Assets: 'Assets',
  Audio: 'Audio',
  Input: 'Input',
  Save: 'Save',
  Network: 'Network',
  Ads: 'Ads',
  Analytics: 'Analytics',
  Push: 'Push',
  Time: 'Time',
  Scene: 'Scene',
  UI: 'UI',
} as const;

export type ServiceName = typeof Services[keyof typeof Services];