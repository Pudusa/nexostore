import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);
  
  constructor(private readonly configService: ConfigService) {}

  /**
   * Check if Write-Through cache is enabled
   */
  isWriteThroughEnabled(): boolean {
    return this.configService.get<boolean>('FEATURE_WRITE_THROUGH', true);
  }

  /**
   * Check if cache monitoring is enabled
   */
  isCacheMonitoringEnabled(): boolean {
    return this.configService.get<boolean>('FEATURE_CACHE_MONITORING', true);
  }

  /**
   * Check if aggressive cache invalidation is enabled
   */
  isAggressiveInvalidationEnabled(): boolean {
    return this.configService.get<boolean>('FEATURE_AGGRESSIVE_INVALIDATION', true);
  }

  /**
   * Get a list of all active features
   */
  getActiveFeatures(): Record<string, boolean> {
    return {
      writeThrough: this.isWriteThroughEnabled(),
      cacheMonitoring: this.isCacheMonitoringEnabled(),
      aggressiveInvalidation: this.isAggressiveInvalidationEnabled(),
    };
  }

  /**
   * Enable a specific feature
   */
  setFeature(feature: string, enabled: boolean): void {
    this.logger.log(`Feature ${feature} set to ${enabled}`);
    // This would typically update a configuration store
    // For now, we log the change
  }
}