import { NativeModule, requireNativeModule } from 'expo';

declare class ForegroundServiceModule extends NativeModule {
  /** Starts the service and shows its notification at `percent`. */
  start(text: string, percent: number): Promise<void>;
  /** Updates the notification. Does nothing if the service is not running. */
  update(percent: number): Promise<void>;
  /** Stops the service and clears the notification. */
  stop(): Promise<void>;
  /** PowerManager's thermal status: 0 none … 3 severe … 6 shutdown. */
  thermalStatus(): number;
  /** Physical RAM in bytes. */
  totalMemory(): number;
  /** Android 13 and up. Resolves true when the notification may be shown. */
  requestNotificationPermission(): Promise<boolean>;
}

export default requireNativeModule<ForegroundServiceModule>('ForegroundService');
