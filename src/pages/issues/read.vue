<script setup lang="ts">
import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import CollapsibleSection from "../../components/CollapsibleSection.vue";
import IssueChart from "../../components/issue/IssueChart.vue";
import Paging from "../../components/paging/Paging.vue";
import SelectBox from "../../components/SelectBox.vue";
import {ref, computed} from "vue";
import {EntityName} from "../../models/count.ts";
import {Envelope} from "../../models/envelope.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {EnvelopeException} from "../../models/envelopeException.ts";
import {loadIssueEvents} from "../../service/loadList.ts";
import {loadIssueEventsCount} from "../../service/loadCount.ts";
import {loadIssueEventsStats, IssueStatEntry} from "../../service/loadStats.ts";
import {PageSelectEvent} from "../../models/pagingPageSelect.ts";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import {TIME_RANGE_CONFIGS, getTimeRangeConfig} from "../../config/timeRangeConfig.ts";
import {router} from "../../router.ts";
import CopyIcon from "../../icons/CopyIcon.vue";
import CheckIcon from "../../icons/CheckIcon.vue";

const issueId = getEntityId(EntityName.Envelope);

const loaded = ref(false);
const eventsLoaded = ref(true);
const envelope = ref<Envelope>({} as Envelope);
const envelopeException = ref<EnvelopeException | null>(null);
const selectedEventId = ref<number>(
    parseInt(new URLSearchParams(window.location.search).get('event_id') || '', 10) || issueId
);

const events = ref<Envelope[]>([]);
const eventsCount = ref(0);
const eventsPage = ref(1);
const eventsOffset = ref(0);
const eventsStats = ref<IssueStatEntry[]>([]);
const selectedTimeRange = ref<string>('all');
const labelUnknown = 'unknown';

const timeRangeOptions = computed<SelectBoxOption[]>(() => {
    return Object.values(TIME_RANGE_CONFIGS).map(config => ({
        value: config.value,
        label: config.label
    }))
})

const chartConfig = computed(() => {
    const config = getTimeRangeConfig(selectedTimeRange.value)
    return {
        interval: config.interval,
        periods: config.periods,
        label: config.label
    }
})

const projectUrl = computed(() => {
  return envelope.value.project ? generateEntityRecordUrl(EntityName.Project, envelope.value.project.ID) : '#';
});

const exceptionValue = computed(() => {
  if (!envelopeException.value) return null

  if (Array.isArray(envelopeException.value.exception)) {
    return envelopeException.value.exception[0]
  } else if (envelopeException.value.exception?.values?.[0]) {
    return envelopeException.value.exception.values[0]
  }
  return null
})

const copiedKey = ref<string | number | null>(null);

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

function isCopied(key: string | number): boolean {
  return copiedKey.value === key;
}

function copyBtnTitle(key: string | number): string {
  return isCopied(key) ? 'Скопировано!' : 'Копировать';
}

function levelClass(): string {
  return `level-${envelopeException.value?.level || labelUnknown}`;
}

function levelLabel(): string {
  return envelopeException.value?.level || labelUnknown;
}

function formattedTimestamp(): string {
  return envelopeException.value?.timestamp
    ? formatDate(envelopeException.value.timestamp)
    : 'N/A';
}

function returnLabelHandled(flag: boolean | undefined): string {
  return flag ? 'handled' : 'unhandled';
}

function mechanismClass(): string {
  return returnLabelHandled(exceptionValue.value?.mechanism?.handled);
}

function mechanismLabel(): string {
  return returnLabelHandled(exceptionValue.value?.mechanism?.handled);
}

function isCurrentEvent(event: Envelope): boolean {
  return event.ID === selectedEventId.value;
}

function shortEventId(event: Envelope): string {
  return event.event_id?.substring(0, 12) ?? '';
}

function eventExceptionLabel(event: Envelope): string {
  return event.exception_value || event.message || '-';
}

function eventSdkLabel(event: Envelope): string {
  return event.sdk ? `${event.sdk.name} ${event.sdk.version}` : '-';
}

function hasExtraInfo(): boolean {
  return !!(envelopeException.value?.extra && Object.keys(envelopeException.value.extra).length > 0);
}

function preContextLineNumber(frame: { lineno: number; pre_context?: string[] }, i: number): number {
  return frame.lineno - (frame.pre_context?.length ?? 0) + i;
}

function copyExtra(key: string | number, value: unknown): void {
  navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  copiedKey.value = key;
  setTimeout(() => { copiedKey.value = null; }, 2000);
}

async function navigateToEvent(eventId: number) {
    selectedEventId.value = eventId;
    router.replace({ path: `/issue/${issueId}`, query: { event_id: eventId.toString() } });
    await loadEventDetails(eventId);
}

async function loadStats() {
    eventsStats.value = await loadIssueEventsStats(
        issueId,
        chartConfig.value.interval,
        chartConfig.value.periods
    )
}

async function loadEvents(off = eventsOffset.value) {
    events.value = await loadIssueEvents(eventsLoaded, issueId, off);
}

async function onTimeRangeChange() {
    await loadStats()
}

async function eventsPageSelect(e: PageSelectEvent) {
    eventsPage.value = e.page
    eventsOffset.value = e.offset
    await loadEvents(e.offset)
}

async function loadEventDetails(eventId: number) {
    envelope.value = await readEntity(EntityName.Envelope, eventId);
    envelopeException.value = null;
    if (envelope.value.EnvelopeEventExtras && envelope.value.EnvelopeEventExtras.length > 1) {
        envelopeException.value = JSON.parse(envelope.value.EnvelopeEventExtras[1].Data);
    }
}

async function initLoad() {
  try {
    await loadEventDetails(selectedEventId.value);

    eventsCount.value = await loadIssueEventsCount(issueId);
    await loadStats();
    await loadEvents(0);

    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

initLoad();
</script>

<template>
  <Sidebar :active=MenuItem.Issues>
    <template v-if="loaded">
      <h2>Issue Details</h2>

      <div class="issue-details">
        <!-- Event Activity Chart -->
        <div class="chart-section">
          <div class="chart-time-filter">
            <SelectBox
                label="Time Range"
                :options="timeRangeOptions"
                v-model="selectedTimeRange"
                @changed="onTimeRangeChange"
            />
          </div>
          <IssueChart
              :interval="chartConfig.interval"
              :periods="chartConfig.periods"
              :label="chartConfig.label"
              :totalEvents="eventsCount"
              :externalStats="eventsStats"
          />
        </div>

        <!-- All Occurrences -->
        <CollapsibleSection title="All Occurrences" :defaultExpanded="true" v-if="eventsCount > 0">
          <div class="occurrences-table">
            <div class="occurrences-header">
              <div class="occ-cell occ-id">Event ID</div>
              <div class="occ-cell occ-date">Date</div>
              <div class="occ-cell occ-exception">Exception Value</div>
              <div class="occ-cell occ-sdk">SDK</div>
            </div>
            <div
                v-for="event in events"
                :key="event.ID"
                class="occurrences-row"
                :class="{ 'current-event': isCurrentEvent(event) }"
                @click="navigateToEvent(event.ID)"
            >
              <div class="occ-cell occ-id">
                <span class="monospace">{{ shortEventId(event) }}...</span>
              </div>
              <div class="occ-cell occ-date">{{ formatDate(event.CreatedAt) }}</div>
              <div class="occ-cell occ-exception">{{ eventExceptionLabel(event) }}</div>
              <div class="occ-cell occ-sdk">{{ eventSdkLabel(event) }}</div>
            </div>
          </div>
          <Paging :page="eventsPage" :limit="10" :count="eventsCount" v-on:page-select="eventsPageSelect" />
        </CollapsibleSection>

        <!-- General Information -->
        <CollapsibleSection title="General Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Event ID:</label>
            <div class="field-value">
              <p class="monospace">{{ envelope.event_id }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Level:</label>
            <div class="field-value">
              <p class="level-badge" :class="levelClass()">
                {{ levelLabel() }}
              </p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Timestamp:</label>
            <div class="field-value">
              <p>{{ formattedTimestamp() }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Created At:</label>
            <div class="field-value">
              <p>{{ formatDate(envelope.CreatedAt) }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelope.project">
            <label class="field-label">Project:</label>
            <div class="field-value">
              <p><a :href="projectUrl" class="link">{{ envelope.project.Name }}</a></p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.environment">
            <label class="field-label">Environment:</label>
            <div class="field-value">
              <p>{{ envelopeException.environment }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.server_name">
            <label class="field-label">Server Name:</label>
            <div class="field-value">
              <p>{{ envelopeException.server_name }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.platform">
            <label class="field-label">Platform:</label>
            <div class="field-value">
              <p>{{ envelopeException.platform }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Exception Information -->
        <CollapsibleSection title="Exception Information" :defaultExpanded="true" v-if="exceptionValue">
          <div class="detail-field">
            <label class="field-label">Exception Type:</label>
            <div class="field-value">
              <p class="exception-type">{{ exceptionValue.type }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Exception Message:</label>
            <div class="field-value">
              <p class="exception-message">{{ exceptionValue.value }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="exceptionValue.mechanism">
            <label class="field-label">Mechanism:</label>
            <div class="field-value">
              <p>{{ exceptionValue.mechanism.type }}
                <span class="badge" :class="mechanismClass()">
                  {{ mechanismLabel() }}
                </span>
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Stack Trace -->
        <CollapsibleSection title="Stack Trace" :defaultExpanded="true" v-if="exceptionValue?.stacktrace?.frames">
          <div class="stacktrace-container">
            <div v-for="(frame, index) in exceptionValue.stacktrace.frames"
                 :key="index"
                 class="stack-frame"
                 :class="{ 'in-app': frame.in_app }">
              <div class="frame-header">
                <span class="frame-function">{{ frame.function }}</span>
                <span class="frame-location">{{ frame.filename }}:{{ frame.lineno }}</span>
              </div>
              <div class="frame-path">{{ frame.abs_path }}</div>

              <div class="frame-code" v-if="frame.context_line">
                <div v-if="frame.pre_context" class="pre-context">
                  <div v-for="(line, i) in frame.pre_context" :key="i" class="code-line">
                    <span class="line-number">{{ preContextLineNumber(frame, i) }}</span>
                    <span class="line-code">{{ line }}</span>
                  </div>
                </div>
                <div class="context-line">
                  <span class="line-number">{{ frame.lineno }}</span>
                  <span class="line-code">{{ frame.context_line }}</span>
                </div>
                <div v-if="frame.post_context" class="post-context">
                  <div v-for="(line, i) in frame.post_context" :key="i" class="code-line">
                    <span class="line-number">{{ frame.lineno + i + 1 }}</span>
                    <span class="line-code">{{ line }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- SDK Information -->
        <CollapsibleSection title="SDK Information" :defaultExpanded="false" v-if="envelope.sdk || envelopeException?.sdk">
          <div class="detail-field" v-if="envelope.sdk">
            <label class="field-label">SDK:</label>
            <div class="field-value">
              <p>{{ envelope.sdk.name }} ({{ envelope.sdk.version }})</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.sdk?.integrations">
            <label class="field-label">Integrations:</label>
            <div class="field-value">
              <p>{{ envelopeException.sdk.integrations.join(', ') }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Context Information -->
        <CollapsibleSection title="Context Information" :defaultExpanded="false" v-if="envelopeException?.contexts">
          <div class="detail-field" v-if="envelopeException.contexts.trace">
            <label class="field-label">Trace ID:</label>
            <div class="field-value">
              <p class="monospace">{{ envelopeException.contexts.trace.trace_id }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException.contexts.trace">
            <label class="field-label">Span ID:</label>
            <div class="field-value">
              <p class="monospace">{{ envelopeException.contexts.trace.span_id }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException.contexts.runtime">
            <label class="field-label">Runtime:</label>
            <div class="field-value">
              <p>{{ envelopeException.contexts.runtime.name }} {{ envelopeException.contexts.runtime.version }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Extra Information -->
        <CollapsibleSection title="Extra Information" :defaultExpanded="false" v-if="hasExtraInfo()">
          <div class="detail-field" v-for="(value, key) in envelopeException?.extra" :key="key">
            <label class="field-label">{{ key }}:</label>
            <div class="field-value">
              <div class="extra-value-wrapper">
                <span
                  class="copy-btn"
                  :class="{ copied: isCopied(key) }"
                  @click="copyExtra(key, value)"
                  :title="copyBtnTitle(key)"
                >
                  <CopyIcon v-if="!isCopied(key)" />
                  <CheckIcon v-else />
                </span>
                <pre class="extra-value">{{ JSON.stringify(value, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </template>
  </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

h2 {
  margin: 0 0 20px;
  font-size: 22px;
}

.chart-section {
  margin-bottom: 24px;

  .chart-time-filter {
    max-width: 250px;
    margin-bottom: 12px;
  }
}

.occurrences-table {
  background: $card_background;
  border: 1px solid $border_color;
  border-radius: $radius_md;
  overflow: hidden;
  margin-bottom: 16px;
}

.occurrences-header {
  display: flex;
  align-items: center;
  background-color: $surface_subtle;
  color: $text_secondary;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid $border_color;
}

.occurrences-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid $border_color;
  color: $text_primary;
  cursor: pointer;
  transition: background-color 0.12s ease;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background-color: $surface_subtle;
  }

  &.current-event {
    background-color: rgba($main_theme_active_color, 0.06);
    font-weight: 500;

    &:hover {
      background-color: rgba($main_theme_active_color, 0.1);
    }
  }
}

.occ-cell {
  padding: 0 8px;

  .monospace {
    font-family: $font_mono;
    font-size: 13px;
    color: $text_secondary;
  }

  &.occ-id {
    flex: 0 0 160px;
  }

  &.occ-date {
    flex: 0 0 200px;
    color: $text_secondary;
  }

  &.occ-exception {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.occ-sdk {
    flex: 0 0 180px;
    text-align: right;
    color: $text_secondary;
  }
}

.issue-details {
  margin-top: 20px;

  .detail-field {
    display: flex;
    margin-bottom: 14px;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }

    .field-label {
      font-size: 13px;
      font-weight: 600;
      min-width: 180px;
      padding-top: 8px;
      color: $text_secondary;
    }

    .field-value {
      flex: 1;

      p {
        margin: 0;
        padding: 8px 0;
        color: $text_primary;
      }

      .monospace {
        font-family: $font_mono;
        font-size: 13px;
        color: $text_secondary;
      }

      .level-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 999px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.04em;

        &.level-error {
          background: $color_danger_soft;
          color: $color_danger;
        }

        &.level-warning {
          background: $color_warning_soft;
          color: $color_warning;
        }

        &.level-info {
          background: rgba($main_theme_active_color, 0.1);
          color: $main_theme_active_color;
        }

        &.level-unknown {
          background: $surface_hover;
          color: $text_secondary;
        }
      }

      .exception-type {
        font-weight: 600;
        color: $color_danger;
      }

      .exception-message {
        color: $color_danger;
        font-weight: 500;
        word-break: break-word;
        overflow-wrap: break-word;
      }

      .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        margin-left: 8px;

        &.handled {
          background: $color_success_soft;
          color: $color_success;
        }

        &.unhandled {
          background: $color_danger_soft;
          color: $color_danger;
        }
      }

      .extra-value-wrapper {
        position: relative;

        &:hover .copy-btn {
          opacity: 1;
        }
      }

      .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: $radius_sm;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, background-color 0.15s, color 0.15s;
        background: $surface_hover;
        color: $text_secondary;
        z-index: 1;

        &:hover {
          background: $border_color_strong;
          color: $text_primary;
        }

        &.copied {
          opacity: 1;
          background: $color_success_soft;
          color: $color_success;
        }
      }

      .extra-value {
        background: $surface_subtle;
        border: 1px solid $border_color;
        border-radius: $radius_md;
        padding: 12px;
        font-family: $font_mono;
        font-size: 12px;
        color: $text_primary;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }

  .stacktrace-container {
    .stack-frame {
      background: $surface_subtle;
      border: 1px solid $border_color;
      border-radius: $radius_md;
      padding: 12px 14px;
      margin-bottom: 12px;

      &.in-app {
        background: $color_warning_soft;
        border-color: rgba($color_warning, 0.35);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .frame-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin: -4px -6px 4px;
        padding: 4px 6px;
        border-radius: $radius_sm;
        transition: background-color 0.12s ease;

        &:hover {
          background-color: $surface_hover;
        }

        .frame-function {
          font-weight: 600;
          color: $main_theme_active_color;
          font-family: $font_mono;
          font-size: 13px;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .frame-location {
          color: $text_muted;
          font-size: 12px;
          font-family: $font_mono;
          white-space: nowrap;
        }
      }

      &.in-app .frame-header:hover {
        background-color: rgba($color_warning, 0.12);
      }

      .frame-path {
        color: $text_muted;
        font-size: 12px;
        margin-bottom: 8px;
        font-family: $font_mono;
        word-break: break-all;
      }

      .frame-code {
        background: $card_background;
        border: 1px solid $border_color;
        border-radius: $radius_sm;
        overflow-x: auto;
        margin-top: 8px;

        .code-line {
          display: flex;
          font-family: $font_mono;
          font-size: 12.5px;
          line-height: 1.5;
          color: $text_primary;

          .line-number {
            display: inline-block;
            min-width: 44px;
            padding: 2px 10px;
            background: $surface_subtle;
            color: $text_muted;
            text-align: right;
            user-select: none;
            border-right: 1px solid $border_color;
          }

          .line-code {
            padding: 2px 10px;
            flex: 1;
            white-space: pre;
          }
        }

        .context-line {
          display: flex;
          background: rgba($color_warning, 0.18);
          font-family: $font_mono;
          font-size: 12.5px;
          line-height: 1.5;
          color: $text_primary;

          .line-number {
            display: inline-block;
            min-width: 44px;
            padding: 2px 10px;
            background: rgba($color_warning, 0.22);
            color: $text_secondary;
            text-align: right;
            user-select: none;
            border-right: 1px solid rgba($color_warning, 0.35);
            font-weight: 600;
          }

          .line-code {
            padding: 2px 10px;
            flex: 1;
            white-space: pre;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
