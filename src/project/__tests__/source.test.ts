import { rehomedSourceUri, sourceName } from '../source';

describe('sourceName', () => {
  it('keeps the container the picker handed over', () => {
    expect(sourceName('file:///data/user/0/com.wordburn.app/cache/ImagePicker/abc.mp4')).toBe(
      'source.mp4'
    );
    expect(sourceName('file:///tmp/clip.webm')).toBe('source.webm');
  });

  it('lowercases it, because a phone writes MOV and a decoder reads mov', () => {
    expect(sourceName('file:///tmp/IMG_0421.MOV')).toBe('source.mov');
  });

  it('assumes mp4 when there is nothing to carry over', () => {
    expect(sourceName('file:///tmp/no-extension')).toBe('source.mp4');
    expect(sourceName('file:///tmp/dotted.name/')).toBe('source.mp4');
  });

  it('ignores a query string', () => {
    expect(sourceName('file:///tmp/clip.mp4?version=2')).toBe('source.mp4');
  });
});

describe('rehomedSourceUri', () => {
  const id = 'pabc12';

  it('follows the project directory when the container has moved', () => {
    const old = `file:///var/mobile/Containers/Data/Application/AAAA/Documents/projects/${id}/source.mov`;
    const now = `file:///var/mobile/Containers/Data/Application/BBBB/Documents/projects/${id}/`;
    expect(rehomedSourceUri(old, id, now)).toBe(`${now}source.mov`);
  });

  it('is the identity when nothing moved', () => {
    const uri = `file:///data/user/0/com.wordburn.app/files/projects/${id}/source.mp4`;
    expect(rehomedSourceUri(uri, id, `file:///data/user/0/com.wordburn.app/files/projects/${id}`)).toBe(uri);
  });

  it('leaves alone anything this app did not copy into the project', () => {
    expect(rehomedSourceUri('content://media/external/video/39', id, 'file:///x/')).toBe(
      'content://media/external/video/39'
    );
    expect(rehomedSourceUri('file:///tmp/ImagePicker/clip.mp4', id, 'file:///x/')).toBe(
      'file:///tmp/ImagePicker/clip.mp4'
    );
  });

  it('does not take another project\'s file', () => {
    expect(rehomedSourceUri(`file:///a/projects/other/source.mp4`, id, 'file:///x/')).toBe(
      'file:///a/projects/other/source.mp4'
    );
  });
});
