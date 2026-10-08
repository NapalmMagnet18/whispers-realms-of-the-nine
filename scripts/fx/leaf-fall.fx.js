fx
pop leaves rate=%rate|3 on=disc(%radius|12).c(%height|9) life=7..11 v=up(-.4..-.8)+sdir()*.3 size=.16..0.26 spin=-2..2 acc=curl(.5)*.9+drag(.6) a=0>.08:1>.85:1>0 sz=$size rot=$age*$spin floor=stick r=mesh({shape:"card",material:"scripts/leaf-fall-look.js"})
