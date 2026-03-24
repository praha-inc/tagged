import { describe, expect, it } from 'vitest';

import { Tagged } from './index.js';

describe('Tagged', () => {
  it('should return an object with a $tag field', () => {
    const User = Tagged({
      tag: 'User',
      fields: Tagged.fields<{ name: string; age: number }>(),
    });

    const user = User({
      name: 'Alice',
      age: 30,
    });

    expect(user).toEqual({
      $tag: 'User',
      name: 'Alice',
      age: 30,
    });
  });

  it('should create an object even with empty fields', () => {
    const Empty = Tagged({
      tag: 'Empty',
    });

    const empty = Empty();

    expect(empty).toEqual({
      $tag: 'Empty',
    });
  });
});
