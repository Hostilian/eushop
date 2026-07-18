import fs from 'fs';
import path from 'path';
import {
  APPLICATION_VIEWS,
  CURRENT_APPLICATION,
  EXPECTED_HISTORICAL_VERSION_KEYS,
  HISTORICAL_SNAPSHOTS,
  VERSION_SELECTOR_OPTIONS,
} from '../data/version-catalog';

describe('version catalogue', () => {
  it('catalogues every recovered static snapshot exactly once', () => {
    expect(HISTORICAL_SNAPSHOTS.map(({ key }) => key)).toEqual(
      EXPECTED_HISTORICAL_VERSION_KEYS,
    );
    expect(new Set(HISTORICAL_SNAPSHOTS.map(({ key }) => key)).size).toBe(
      HISTORICAL_SNAPSHOTS.length,
    );
  });

  it.each(HISTORICAL_SNAPSHOTS)(
    '$key points to a complete public snapshot',
    (snapshot) => {
      const snapshotDirectory = path.join(
        process.cwd(),
        'public',
        snapshot.path.replace(/^\//, ''),
      );

      expect(snapshot.kind).toBe('historical-snapshot');
      expect(snapshot.path).toBe(`/${snapshot.key}/`);
      expect(snapshot.introducedIn).toMatch(/^[0-9a-f]{8}$/);

      for (const requiredFile of [
        'index.html',
        'app.js',
        'data.js',
        'styles.css',
      ]) {
        expect(
          fs.existsSync(path.join(snapshotDirectory, requiredFile)),
        ).toBe(true);
      }
    },
  );

  it('separates current routes from historical snapshots', () => {
    expect(CURRENT_APPLICATION.kind).toBe('current-application');
    expect(
      APPLICATION_VIEWS.every(({ kind }) => kind === 'application-view'),
    ).toBe(true);
    expect(VERSION_SELECTOR_OPTIONS).toEqual([
      CURRENT_APPLICATION,
      ...HISTORICAL_SNAPSHOTS,
    ]);
  });

  it('does not repeat the removed compliance or biometric claims', () => {
    const catalogueText = [
      CURRENT_APPLICATION,
      ...APPLICATION_VIEWS,
      ...HISTORICAL_SNAPSHOTS,
    ]
      .map(({ name, description }) => `${name} ${description}`)
      .join(' ');

    expect(catalogueText).not.toMatch(/strict\s+(DSA|DAC7|GDPR).*compliance/i);
    expect(catalogueText).not.toMatch(/biometric|zero-step checkout/i);
  });
});
