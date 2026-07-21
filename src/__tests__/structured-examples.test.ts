import { structuredExamples } from '@examples/structured';

describe('structured examples', () => {
  it('places annotation alignment variants around one shared anchor', () => {
    const example = structuredExamples.find(
      ({ title }) => title === 'annotation alignment variants [ascii]',
    );
    if (!example) throw new Error('missing annotation alignment variants [ascii] example');

    const lines = example.render().split('\n');
    const left = lines.find((line) => line.includes('left'))!;
    const center = lines.find((line) => line.includes('center'))!;
    const right = lines.find((line) => line.includes('right'))!;
    const anchorColumn = center.indexOf('center') + Math.floor('center'.length / 2);

    expect(left.indexOf('left') + 'left'.length - 1).toBe(anchorColumn);
    expect(right.indexOf('right')).toBe(anchorColumn);
  });
});
