# @praha/tagged

[![npm version](https://badge.fury.io/js/@praha%2Ftagged.svg)](https://www.npmjs.com/package/@praha/tagged)
[![npm download](https://img.shields.io/npm/dm/@praha/tagged.svg)](https://www.npmjs.com/package/@praha/tagged)
[![license](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/praha-inc/tagged/blob/main/LICENSE)
[![Github](https://img.shields.io/github/followers/praha-inc?label=Follow&logo=github&style=social)](https://github.com/orgs/praha-inc/followers)

Lightweight TypeScript tagged union (discriminated union) utilities.

## 👏 Getting Started

### Installation

```bash
npm install @praha/tagged
```

### Usage

#### Basic Usage

Define a tagged type using the `Tagged` factory:

```ts
import { Tagged } from '@praha/tagged';

const User = Tagged({
  tag: 'User',
  fields: Tagged.fields<{ name: string; age: number }>(),
});

const user = User({ name: 'Alice', age: 30 });
// => { $tag: 'User', name: 'Alice', age: 30 }
```

#### Tag-Only (No Fields)

```ts
const Loading = Tagged({ tag: 'Loading' });

const loading = Loading();
// => { $tag: 'Loading' }
```

#### Discriminated Union

Combine multiple tagged types into a union for exhaustive type narrowing:

```ts
import { Tagged } from '@praha/tagged';

const Success = Tagged({
  tag: 'Success',
  fields: Tagged.fields<{ data: string }>(),
});

const Failure = Tagged({
  tag: 'Failure',
  fields: Tagged.fields<{ message: string }>(),
});

const Loading = Tagged({
  tag: 'Loading',
});

type Result = (
  | typeof Success.$infer
  | typeof Failure.$infer
  | typeof Loading.$infer
);

const handle = (result: Result) => {
  switch (result.$tag) {
    case 'Success':
      console.log(result.data);
      break;
    case 'Failure':
      console.error(result.message);
      break;
    case 'Loading':
      console.log('Loading...');
      break;
  }
};
```

#### Inferring Types

Use `$infer` to extract the TypeScript type from a factory:

```typescript
type User = typeof User.$infer;
// => { $tag: 'User'; name: string; age: number }
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome.

Feel free to check [issues page](https://github.com/praha-inc/tagged/issues) if you want to contribute.

## 📝 License

Copyright © [PrAha, Inc.](https://www.praha-inc.com/)

This project is [```MIT```](https://github.com/praha-inc/tagged/blob/main/LICENSE) licensed.
