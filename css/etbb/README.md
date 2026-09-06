# ETbb (ET Bembo)

The site's serif. ETbb is Michael Sharpe's extended build of ET Book — the same
Bembo revival Tufte CSS ships — with full Latin Extended-A coverage. That
coverage is the reason it is here: the original et-book webfonts have no
`ğ Ğ ı İ ş Ş`, so Turkish text fell back to Palatino/Georgia mid-word.

Source: CTAN package `etbb` (https://ctan.org/pkg/etbb), version 1.057,
`opentype/ETbb-{Regular,Italic,Bold,BoldItalic}.otf`. MIT licensed — see
LICENSE, which carries the original ET Book copyright.

The `.woff2`/`.woff` files here are lossless repackagings of those OTFs (same
sfnt tables, only the container differs). To regenerate after a CTAN update:

    curl -sSL -o etbb.zip https://mirrors.ctan.org/fonts/etbb.zip && unzip etbb.zip
    npx -p wawoff2 woff2_compress.js etbb/opentype/ETbb-Regular.otf   # repeat per style

Figures are lining by default, as in the old et-book body face; the old-style
set the sidenote numbers use lives in the font's `onum` feature, reached from
CSS with `font-variant-numeric: oldstyle-nums` (no separate font file needed).
