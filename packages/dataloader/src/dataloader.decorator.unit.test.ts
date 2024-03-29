import {BindingScope, Context, inject, injectable} from '@loopback/context';
import {expect} from 'chai';
import type DataLoader from 'dataloader';
import {fake} from 'sinon';
import {dataloader} from './dataloader.decorator.js';
import {DataLoaderProviderInterface} from './types.js';

describe('Dataloader Decorator', () => {
  it('allows creation of an injectable dataloader', async () => {
    @dataloader({
      cache: true,
    })
    class TestDataLoader implements DataLoaderProviderInterface<string, number> {
      constructor(@inject('testPrefix') private readonly test: number) {}
      async load(keys: readonly string[]) {
        return keys.map(k => parseInt(k) + this.test);
      }
    }

    const c = new Context();
    c.bind('testPrefix').to(10);
    c.bind('testDataLoader').toInjectable(TestDataLoader);
    const previxVal = await c.get('testPrefix');
    expect(previxVal).to.equal(10);

    const loader = await c.get<DataLoader<string, number>>('testDataLoader', {optional: false});
    expect(loader).to.exist;
    const results = await loader!.loadMany(['1', '2', '3']);
    expect(results).to.deep.equal([11, 12, 13]);
  });

  it('only invokes our test repository once', async () => {
    interface ITestRepo {
      find(ids: readonly string[]): Promise<number[]>;
    }
    const mockFind = fake.resolves([1, 2, 3]);
    const testRepo: ITestRepo = {
      find: mockFind,
    };
    const c = new Context();
    const r = new Context(c);
    r.scope = BindingScope.REQUEST;

    c.bind('testRepo').to(testRepo).inScope(BindingScope.SINGLETON);
    @dataloader({
      cache: true,
    })
    class TestDataLoader implements DataLoaderProviderInterface<string, number> {
      constructor(@inject('testRepo') private readonly repo: ITestRepo) {}
      async load(keys: readonly string[]) {
        return this.repo.find(keys);
      }
    }

    c.bind('testDataLoader').toInjectable(TestDataLoader);

    @injectable()
    class TestService {
      constructor(@dataloader<string, number>('testDataLoader') private readonly loader: DataLoader<string, number>) {}
      async get(ids: readonly string[]) {
        return this.loader.loadMany(ids);
      }
    }

    c.bind('testService').toClass(TestService);

    const testingService = await r.get<TestService>('testService', {optional: false});
    expect(testingService).to.exist;
    const results1 = await testingService!.get(['1', '2', '3']);
    expect(results1).to.deep.equal([1, 2, 3]);
    expect(mockFind.callCount).to.equal(1);

    const results2 = await testingService!.get(['1', '2', '3']);
    expect(results2).to.deep.equal([1, 2, 3]);
    expect(mockFind.callCount).to.equal(1);

    // new request should use a new loader
    const r2 = new Context(c);
    const service2 = await r2.get<TestService>('testService', {optional: false});
    const results3 = await service2!.get(['1', '2', '3']);
    expect(results3).to.deep.equal([1, 2, 3]);
    expect(mockFind.callCount).to.equal(2);
  });
});
