import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { findReferencedToolboxToolIds, type HostTool } from './broker';
import { validateCallableActionManifest, validateSchema } from './manifest';

const exampleRoot = path.resolve(process.cwd(), '../../docs/examples/tool-a-skill-b');
const exampleToolRoot = path.join(exampleRoot, 'tool-a');

describe('natural-language tool a and Skill b documentation example', () => {
  it('keeps the documented weather action callable and schema-valid', async () => {
    const manifest = validateCallableActionManifest(
      JSON.parse(await fs.readFile(path.join(exampleToolRoot, 'tool.json'), 'utf8')),
    );
    const action = manifest.actions.find((item) => item.id === 'current-weather');
    expect(action).toBeDefined();

    const fetchMock = vi.fn(async (..._args: unknown[]) => ({
      ok: true,
      status: 200,
      json: async () => ({
        timezone: 'Asia/Shanghai',
        current: {
          time: '2026-09-19T21:30',
          temperature_2m: 24.1,
          apparent_temperature: 24.6,
          relative_humidity_2m: 61,
          precipitation: 0,
          weather_code: 1,
          wind_speed_10m: 8.4,
        },
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    try {
      const module = await import(
        pathToFileURL(path.join(exampleToolRoot, action!.executor.entry!)).href
      );
      const value = await module.execute({});
      validateSchema(action!.outputSchema, value);

      expect(value).toEqual({
        city: '西安',
        observedAt: '2026-09-19T21:30',
        timezone: 'Asia/Shanghai',
        temperatureC: 24.1,
        apparentTemperatureC: 24.6,
        humidityPercent: 61,
        precipitationMm: 0,
        weatherCode: 1,
        windSpeedKmh: 8.4,
        source: 'Open-Meteo',
      });

      const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);
      expect(requestedUrl).toContain('api.open-meteo.com/v1/forecast');
      expect(requestedUrl).toContain('timezone=Asia%2FShanghai');
      expect(requestedUrl).toContain('temperature_2m');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps Skill b natural-language-only', async () => {
    const skill = await fs.readFile(path.join(exampleRoot, 'skill-b/SKILL.md'), 'utf8');
    expect(skill).toContain('调用a工具，将天气进行JSON化处理返回。');
    expect(skill).toContain('$ARGUMENTS');
    expect(skill).not.toContain('toolbox.');
    expect(skill).not.toContain('inputSchema');
  });

  it('resolves a one-letter visible name only when it is explicitly called a tool', () => {
    const tool = {
      id: 'toolbox.internal-id.current-weather',
      aliases: ['a'],
    } as HostTool;

    expect(findReferencedToolboxToolIds([tool], ['调用a工具，将天气进行JSON化处理返回'])).toEqual(
      new Set([tool.id]),
    );
    expect(
      findReferencedToolboxToolIds([tool], ['This is a normal sentence with a single a.']),
    ).toEqual(new Set());
  });
});
