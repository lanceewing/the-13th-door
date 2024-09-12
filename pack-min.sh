#!/usr/bin/sh

# Start with some substitutions to avoid Terser breaking things.
cat Logic.js Util.js Sprite.js Ego.js player-small.js Sound.js Game.js | sed 's/this.keys/this.kys/g' | sed 's/[.]screen/.scrn/g' | sed 's/flags/flgs/g' | sed 's/process[(]/prcs(/g' | sed 's/update[(]/updt(/g' | sed 's/setPosition[(]/setPstn(/g' | sed 's/reset[(]/rstt(/g' | sed 's/this.canvas/this.cnvs/g' | sed 's/this.content/this.cntnt/g' | sed 's/hide[(]/_hide(/g' | sed 's/show[(]/shw(/g' | sed 's/this.direction/this.drctn/g' | sed 's/this.heading/this.hdng/g' | sed 's/left[(]/_left(/g' | sed 's/right[(]/_right(/g' | sed 's/init[(]/_init(/g' | sed 's/[.]init/._init/g' | sed 's/this.step/this.stp/g' | sed 's/stepFactor/stpFactor/g' | sed 's/move[(]/_move(/g' | sed 's/stop[(]/_stop(/g' | sed 's/start[(]/_start(/g' | sed 's/getItem[(]/getItm(/g' | sed 's/re_move/remove/g' > combined.js
echo ";onload=()=>new Game" >> combined.js

# Perform standard minification of the JS and CSS.
npm run minify-js
npm run minify-css
rm combined.js

# Construct the roadroller input file.
echo 'document.write(`' > roadroller_input.js
echo '<style>' >> roadroller_input.js
cat min.css >> roadroller_input.js
echo '</style>' >> roadroller_input.js
cat min_mid.html >> roadroller_input.js
echo '`);' >> roadroller_input.js
cat jsfxr.js >> roadroller_input.js
cat min.js >> roadroller_input.js

# Use roadroller to compress the JS, CSS and most of the HTML.
npx roadroller roadroller_input.js -o roadroller_min.js -D -Zab16 -Zlr1459 -Zmc4 -Zmd36 -Zpr15 -S0,1,2,3,7,10,13,14,25,51,228,387

# Put it all together.
cat min_head.html roadroller_min.js min_foot.html  | tr -d '\n' > min.html
