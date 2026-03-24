/**
 * Represents a tagged (discriminated) union member.
 *
 * Combines arbitrary `Fields` with a `$tag` discriminant property,
 * enabling TypeScript to narrow the type in `switch` / `if` statements.
 *
 * @typeParam Tag - The literal string used as the discriminant value.
 *   Defaults to `string` when no concrete tag is provided.
 * @typeParam Fields - The additional payload properties attached to this
 *   variant. Defaults to an empty record (no extra fields).
 *
 * @example
 * ```ts
 * type User = Tagged<'User', { name: string; age: number }>;
 * // => { $tag: 'User'; name: string; age: number }
 *
 * type Loading = Tagged<'Loading'>;
 * // => { $tag: 'Loading' }
 * ```
 */
export type Tagged<
  Tag extends string = string,
  Fields extends Record<string, unknown> = Record<never, never>,
> = Fields & {
  /** The discriminant property that identifies this variant. */
  $tag: Tag;
};

/**
 * A callable factory that constructs {@link Tagged} values for a specific variant.
 *
 * Returned by the {@link Tagged} function. In addition to being callable,
 * it exposes the `$infer` phantom property so callers can extract the
 * resulting TypeScript type without instantiating a value.
 *
 * - When `Fields` is empty, the factory is called with no arguments: `Variant()`.
 * - When `Fields` has properties, the factory requires them as its sole argument:
 *   `Variant({ ...fields })`.
 *
 * @typeParam Tag - The literal discriminant string for this variant.
 * @typeParam Fields - The payload type associated with this variant.
 *
 * @example
 * ```ts
 * const Loading = Tagged({ tag: 'Loading' });
 * // TaggedFactory<'Loading', Record<never, never>>
 *
 * const Ok = Tagged({ tag: 'Ok', fields: Tagged.fields<{ value: number }>() });
 * // TaggedFactory<'Ok', { value: number }>
 *
 * // Extract the static type without creating a value:
 * type Ok = typeof Ok.$infer;
 * // => { $tag: 'Ok'; value: number }
 * ```
 */
export type TaggedFactory<
  Tag extends string = string,
  Fields extends Record<string, unknown> = Record<never, never>,
> = {
  /**
   * Constructs a {@link Tagged} value for this variant.
   *
   * The argument is required when `Fields` has at least one property,
   * and must be omitted (or `void`) when `Fields` is empty.
   *
   * @param fields - The payload to attach to the tagged value.
   *   Omit this argument entirely when the variant carries no extra data.
   * @returns A new {@link Tagged} object with `$tag` set to the variant's
   *   tag and all provided fields spread onto it.
   */
  (fields: Record<never, never> extends Fields ? void : Fields): Tagged<Tag, Fields>;

  /**
   * Phantom property used solely for type inference.
   *
   * Never holds a runtime value — access it only via `typeof Factory.$infer`
   * in type positions.
   *
   * @example
   * ```ts
   * const User = Tagged({ tag: 'User', fields: Tagged.fields<{ name: string }>() });
   * type User = typeof User.$infer;
   * // => { $tag: 'User'; name: string }
   * ```
   */
  $infer: Tagged<Tag, Fields>;
};

/**
 * Creates a {@link TaggedFactory} for a single discriminated-union variant.
 *
 * Call this once per variant to obtain a factory function. The factory
 * can then be called to create values, and its `$infer` property can be
 * used to extract the static type.
 *
 * Use {@link Tagged.fields} as a zero-cost helper to declare `Fields`
 * without providing a runtime value.
 *
 * @typeParam Tag - Inferred from `props.tag`. The literal string that
 *   acts as the discriminant for this variant.
 * @typeParam Fields - Inferred from `props.fields` (via {@link Tagged.fields}).
 *   Defaults to an empty record when `fields` is omitted.
 *
 * @param props - Configuration object for the variant.
 * @param props.tag - The discriminant string literal. Must be unique
 *   among all variants in the same union.
 * @param props.fields - A type-level placeholder produced by
 *   {@link Tagged.fields}. Carries no runtime data; used only to
 *   communicate the `Fields` type to the factory.
 * @returns A {@link TaggedFactory} bound to `Tag` and `Fields`.
 *
 * @example Basic usage with fields
 * ```ts
 * const User = Tagged({
 *   tag: 'User',
 *   fields: Tagged.fields<{ name: string; age: number }>(),
 * });
 *
 * const user = User({ name: 'Alice', age: 30 });
 * // => { $tag: 'User', name: 'Alice', age: 30 }
 * ```
 *
 * @example Tag-only variant (no fields)
 * ```ts
 * const Loading = Tagged({ tag: 'Loading' });
 *
 * const loading = Loading();
 * // => { $tag: 'Loading' }
 * ```
 *
 * @example Discriminated union with exhaustive narrowing
 * ```ts
 * const Success = Tagged({
 *   tag: 'Success',
 *   fields: Tagged.fields<{ data: string }>(),
 * });
 * const Failure = Tagged({
 *   tag: 'Failure',
 *   fields: Tagged.fields<{ message: string }>(),
 * });
 * const Loading = Tagged({
 *   tag: 'Loading',
 * });
 *
 * type Result = (
 *   | typeof Success.$infer
 *   | typeof Failure.$infer
 *   | typeof Loading.$infer
 * );
 *
 * const handle = (result: Result) => {
 *   switch (result.$tag) {
 *     case 'Success':
   *     console.log(result.data);
   *     break;
 *     case 'Failure':
 *       console.error(result.message);
 *       break;
 *     case 'Loading':
 *       console.log('Loading...');
 *       break;
 *   }
 * };
 * ```
 */
export const Tagged = <
  Tag extends string = string,
  Fields extends Record<string, unknown> = Record<never, never>,
>(props: {
  tag: Tag;
  fields?: Fields;
}): TaggedFactory<Tag, Fields> => {
  return ((fields?: Fields) => ({ ...fields, $tag: props.tag })) as unknown as TaggedFactory<Tag, Fields>;
};

/**
 * A compile-time helper that declares the `Fields` type for a tagged variant
 * without providing any runtime value.
 *
 * Pass the result of this call to the `fields` option of {@link Tagged} so
 * TypeScript can infer the correct `Fields` type parameter. The function
 * always returns `undefined` at runtime; the type parameter is the only
 * thing that matters.
 *
 * @typeParam Fields - The shape of the payload properties for the variant.
 * @returns `undefined` cast to `Fields` — never use the runtime value.
 *
 * @example
 * ```ts
 * const User = Tagged({
 *   tag: 'User',
 *   fields: Tagged.fields<{ name: string; age: number }>(),
 * });
 * ```
 */
Tagged.fields = <Fields extends Record<string, unknown>>() => undefined as unknown as Fields;
