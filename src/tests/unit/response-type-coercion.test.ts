import { describe, expect, it } from 'vitest';
import { ProxyService } from '../../modules/proxy-gateway/server/proxy.service';
import { Tool } from '../../modules/proxy-gateway/antigravity/types';

class TestableProxyService extends ProxyService {
  constructor() {
    super({} as any, {} as any);
  }

  public testCoerceGeminiResponse(response: any, tools?: Tool[]): void {
    return (this as any).coerceGeminiResponse(response, tools);
  }

  public testCoerceGeminiPart(part: any, tools?: Tool[]): void {
    return (this as any).coerceGeminiPart(part, tools);
  }
}

describe('ProxyService Response Type Coercion', () => {
  const tools: Tool[] = [
    {
      name: 'configure_system',
      description: 'Configure system settings',
      input_schema: {
        type: 'object',
        properties: {
          timeout: {
            type: 'integer',
          },
          ratio: {
            type: 'number',
          },
          enabled: {
            type: 'boolean',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          nested: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
              },
            },
          },
        },
      },
    },
  ];

  it('coerces stringified numbers and booleans back to their original types in GeminiResponse', () => {
    const service = new TestableProxyService();

    const response: any = {
      candidates: [
        {
          content: {
            role: 'model',
            parts: [
              {
                functionCall: {
                  name: 'configure_system',
                  args: {
                    timeout: '1440',
                    ratio: '3.14',
                    enabled: 'true',
                    tags: ['a', 'b'],
                    nested: {
                      count: '42',
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    };

    service.testCoerceGeminiResponse(response, tools);

    const args = response.candidates![0].content!.parts![0].functionCall!.args;
    expect(args.timeout).toBe(1440);
    expect(args.ratio).toBe(3.14);
    expect(args.enabled).toBe(true);
    expect(args.tags).toEqual(['a', 'b']);
    expect(args.nested.count).toBe(42);
  });

  it('coerces stringified numbers and booleans back to their original types in GeminiPart', () => {
    const service = new TestableProxyService();

    const part = {
      functionCall: {
        name: 'configure_system',
        args: {
          timeout: '60',
          ratio: '0.5',
          enabled: 'false',
        },
      },
    };

    service.testCoerceGeminiPart(part, tools);

    expect(part.functionCall.args.timeout).toBe(60);
    expect(part.functionCall.args.ratio).toBe(0.5);
    expect(part.functionCall.args.enabled).toBe(false);
  });
});
