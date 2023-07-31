---
sidebar_position: 1
---

# Basics

Loopback's Inversion of Control container, and how it performs Dependency Injection, begin with the `Context` object.

```ts
import {Context} from '@loopback/context';

const ctx = new Context();
ctx.bind<number>('SomeNumber').toValue(15);
const boundNumber = ctx.get('SomeNumber'); // 15
```

# Best Practices

Everything in this section is a matter of opinion. The Loopback Team encourages you to have your own patterns to follow, and best practices to adhere to.

:::danger **Bad** Using plain strings as binding keys.

:::

```ts
ctx.bind<number>('SomeNumber').toValue(15);
```

:::

:::caution

**Good** Use class names as binding keys.

:::

```ts
import {injectable, Context} from '@loopback/context';

@injectable()
class MyInjectableClass implements SomeInterface {}

ctx.bind<SomeInterface>(MyInjectableClass.name).toClass(MyInjectableClass);
```

:::tip

**Better** Define constants (or constants in a namespace) that can be used to chare binding keys.

:::
This is the pattern that the `loopback-next` packages themselves use. I makes sharing binding keys trivial.

```ts
// keys.ts
export const BindingKeys = {
  SomeNumber: 'io.loopback.documentation.graphql.01-basics.SomeNumber',
};

// main.ts
import {BindingKeys} from './keys';

ctx.bind<number>(BindingKeys.SomeNumber).toValue(15);
```

:::tip

**Best** Use typed binding keys, and let the TypeScript langue server shine!

:::

```ts
// keys.ts
import { BindingKey } from '@loopback/context';
export const BindingKeys = {
  SomeNumber: BindingKey.fromString<number>()'io.loopback.documentation.graphql.01-basics.SomeNumber'),
}

// main.ts
import { BindingKeys } from './keys';

ctx.bind(BindingKeys.SomeNumber).toValue(15);

// Typescript will infer that `val` is expected to be a `number`
const val = ctx.get(BindingKeys.SomeNumber)
```
