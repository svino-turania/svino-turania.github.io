/**
 * Eleventy configuration.
 *
 * Templates hold structure and derived formatting only. All content lives in
 * src/index.md: the date, the editable values (including the photograph
 * description) in front matter, the Cantina prose in the Markdown body.
 */

function asUtcDate(value) {
  if (value instanceof Date) {
    return value;
  }
  return new Date(`${value}T00:00:00Z`);
}

const weekdayIt = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  timeZone: 'UTC',
});
const monthIt = new Intl.DateTimeFormat('it-IT', {
  month: 'long',
  timeZone: 'UTC',
});

function formatMonthYear(value) {
  const date = asUtcDate(value);
  return `${monthIt.format(date)} ${date.getUTCFullYear()}`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });

  // The local preview must be as JavaScript-free as the deployed page.
  eleventyConfig.setServerOptions({ liveReload: false });

  eleventyConfig.addFilter('dayNumber', (value) =>
    String(asUtcDate(value).getUTCDate()),
  );

  eleventyConfig.addFilter('weekdayIt', (value) =>
    weekdayIt.format(asUtcDate(value)).toUpperCase(),
  );

  eleventyConfig.addFilter('monthYearIt', (value) =>
    formatMonthYear(value).toUpperCase(),
  );

  eleventyConfig.addFilter('dateLongIt', (value) => {
    const date = asUtcDate(value);
    return `${date.getUTCDate()} ${formatMonthYear(value)}`;
  });

  eleventyConfig.addFilter('isoDate', (value) =>
    asUtcDate(value).toISOString().slice(0, 10),
  );

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
  };
};
