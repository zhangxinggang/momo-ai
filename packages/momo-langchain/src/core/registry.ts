/** 按 kind 注册与解析工厂 */
export class KindRegistry<TKind extends string, TInstance> {
  private readonly factories = new Map<TKind, () => TInstance>();

  register(kind: TKind, factory: () => TInstance): void {
    this.factories.set(kind, factory);
  }

  create(kind: TKind): TInstance {
    const factory = this.factories.get(kind);
    if (!factory) {
      throw new Error(`未注册的 kind: ${kind}`);
    }
    return factory();
  }
}
