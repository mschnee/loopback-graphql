import {Context, inject} from '@loopback/context';
import {expect} from 'chai';
import type DataLoader from 'dataloader';
import {DataLoaderProvider} from './DataLoader.provider';
import {dataloader} from './dataloader.decorator';

describe('Dataloader Decorator', () => {
  it('allows creation of an injectable dataloader', async () => {
    @dataloader({
      cache: true,
    })
    class TestDataLoader extends DataLoaderProvider<string, number> {
      constructor(@inject('testPrefix') private readonly test: number) {
        super();
      }
      async load(keys: readonly string[]) {
        return keys.map(k => parseInt(k) + this.test);
      }
    }

    const c = new Context();
    c.bind('testPrefix').to(10);
    c.bind('testDataLoader').toProvider(TestDataLoader);
    const previxVal = await c.get('testPrefix');
    expect(previxVal).to.equal(10);

    const loader = await c.get<DataLoader<string, number>>('testDataLoader', {optional: false});
    expect(loader).to.exist;
    expect(loader!.load).to.exist;
    let results = await loader!.loadMany(['1', '2', '3']);
    expect(results).to.deep.equal([11, 12, 13]);
  });
});
