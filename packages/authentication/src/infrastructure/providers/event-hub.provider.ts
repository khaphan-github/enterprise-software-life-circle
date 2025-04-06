import { EventBridgeImpl } from '../event-hub/event-birdge.impl';

export const EVENT_HUB_PROVIDER = 'EVENT_HUB_PROVIDER';
export const EventHubProvider = {
  provide: EVENT_HUB_PROVIDER,
  useFactory: () => {
    return new EventBridgeImpl();
  },
};
