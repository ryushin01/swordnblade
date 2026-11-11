import type { SwordTranslation } from '@snb/domain';

/**
 * 시드 도검의 영어 글. 한국어 원문(seed.ts)을 옮긴 것이며, 이름은 각 도검의 nameEn을 씁니다.
 * 상품 id로 찾으므로, 예전에 저장된 Mock 데이터에 번역이 없어도 쇼핑몰이 이 글을 쓸 수 있습니다.
 */
export const SEED_TRANSLATIONS_EN: Record<string, SwordTranslation> = {
  'sw-001': {
    era: 'Late Joseon · 18th century',
    summary:
      'A long two-handed sword of Joseon, with a copper sleeve over the blade root and a long grip wound tightly in red cord.',
    description:
      'Recreated from the ssangsudo recorded in the Muyedobotongji. The unfullered single-edged blade curves gently toward the tip, with a wave-shaped temper line along the edge. A riveted copper sleeve covers the blade root, followed by a thick, plain round brass guard with a cylindrical brass collar, a long grip wound tightly in red cord and a flat brass end cap.',
    material: 'High-carbon steel, copper sleeve, brass guard and cap, red cord',
    stories: [
      {
        when: 'Late 16th c.',
        text: 'During the Imjin War, techniques for wielding a long sword with both hands reached the Joseon army.',
      },
      {
        when: '1790',
        text: 'The Muyedobotongji, compiled under King Jeongjo, records the ssangsudo with illustrated stances and movements.',
      },
      {
        when: 'Today',
        text: 'The blade is forged again to the recorded proportions, and the grip is wound in red cord with no gaps.',
      },
    ],
  },
  'sw-002': {
    era: 'Joseon · 15th–19th century',
    summary: 'The standard sword of Joseon soldiers, hung from the belt by a ring.',
    description:
      'Its name comes from the ring on the scabbard that hangs it from the belt. Short and light, it is easy to draw on horseback. The grip is tightly wrapped in brown cotton cord and matched with silver-toned iron fittings.',
    material: 'High-carbon steel, iron fittings, cotton cord',
    stories: [
      {
        when: '15th c.',
        text: 'Under King Sejong, the length and form of the hwando were standardised so soldiers carried the same sword.',
      },
      { when: '19th c.', text: 'It remained the standard sword of soldiers and military officers until late Joseon.' },
    ],
  },
  'sw-003': {
    era: 'Joseon · Royal ceremonial sword',
    summary: 'A double-edged sword inlaid with constellations, said to be forged when the tiger hour came four times.',
    description:
      'A royal sword against evil, said to be forged in the year, month, day and hour of the tiger. The straight double-edged blade is inlaid in gold with the Big Dipper and the twenty-eight lunar mansions.',
    material: 'Folded steel, gold inlay, black-lacquered grip',
    stories: [
      { when: 'Joseon', text: 'Made by the royal court to ward off evil, and sometimes granted to officials.' },
      {
        when: 'Today',
        text: 'Engraving the constellations on both faces and hammering in gold wire takes two months.',
      },
    ],
  },
  'sw-004': {
    era: 'Muromachi to Edo period',
    summary: 'A Japanese sword worn edge-up through the belt, with a navy cord and rayskin grip.',
    description:
      'Navy silk cord is wrapped over white rayskin to leave diamond-shaped windows. Along the edge runs a wave pattern (hamon) made by clay-coated hardening. Shipped from the fictional Kyoto workshop “Shirakabe”.',
    material: 'Tamahagane steel, rayskin, silk cord',
    stories: [
      {
        when: '15th c.',
        text: 'The uchigatana, quick to draw on foot, spreads in place of the long tachi used on horseback.',
      },
      {
        when: 'Edo period',
        text: 'Wearing a long and a short sword together (daishō) becomes the formal custom of the samurai.',
      },
    ],
  },
  'sw-005': {
    era: 'Edo period',
    summary: 'The short companion to the long sword, with a russet cord and a groove along the blade.',
    description:
      'A short sword kept at hand even indoors. A groove (bohi) along the back lightens the blade, and the grip is wrapped in russet cord.',
    material: 'Tamahagane steel, rayskin, silk cord',
    stories: [{ when: 'Edo period', text: 'Paired with the uchigatana, it marks the status of the samurai.' }],
  },
  'sw-006': {
    era: 'Ming to Qing',
    summary: 'A long, slender Chinese two-handed sword named after a young rice shoot.',
    description:
      'The name comes from its thin, long blade that resembles a rice seedling. The long grip is swung widely with both hands. Shipped from a fictional workshop in Suzhou.',
    material: 'Spring steel, brass fittings, cotton cord',
    stories: [
      {
        when: 'Late Ming',
        text: 'Its roots are said to lie in the long-sword methods Qi Jiguang’s army developed against pirates.',
      },
    ],
  },
  'sw-007': {
    era: 'A form handed down since the Spring and Autumn period',
    summary: 'A straight double-edged sword with a red tassel, named after Longquan, the town of swordsmiths.',
    description:
      'A double-edged sword with a straight central ridge. It carries a brass guard shaped like bat wings, a pear-shaped pommel and a red sword tassel.',
    material: 'High-carbon steel, brass, cotton cord',
    stories: [
      {
        when: 'Legend',
        text: 'The well water used to forge famous swords was so good that the town was called Longquan, “Dragon Spring”.',
      },
    ],
  },
  'sw-008': {
    era: 'Europe, 14th–16th century',
    summary: 'A medieval European cross-hilted sword held with one hand and a half, or both hands.',
    description:
      'A double-edged blade with a long, wide fuller, a straight crossguard and a wheel pommel. The grip is wrapped in leather with three raised bands. Shipped from a fictional workshop in Solingen.',
    material: 'Spring steel, wrought iron, leather',
    stories: [{ when: '15th c.', text: 'German fencing manuals record longsword techniques with illustrations.' }],
  },
  'sw-009': {
    era: 'Scandinavia, 8th–11th century',
    summary: 'A one-handed Norse sword with a three-lobed pommel and a wide fuller.',
    description:
      'A one-handed sword with a rounded tip and a wide fuller. The three-lobed pommel and short guard are capped in bronze, and the grip is wound with silver wire.',
    material: 'Pattern-welded steel, bronze, silver wire',
    stories: [{ when: '9th c.', text: 'Fine blades made along the Rhine were traded as far as Scandinavia.' }],
  },
  'sw-010': {
    era: 'Roman Republic to Empire',
    summary: 'The short thrusting sword of the Roman legionary, with a bone grip and round pommel.',
    description:
      'A short, wide blade for thrusting between shields. It pairs a finger-grooved bone grip, a wooden guard and a round pommel. Shipped from a fictional workshop near Rome.',
    material: 'Carbon steel, ox bone, beech wood',
    stories: [
      { when: '3rd c. BC', text: 'Based on swords from Hispania, it becomes the standard sword of the Roman legion.' },
    ],
  },
  'sw-011': {
    era: 'Scotland, 15th–17th century',
    summary: 'The great two-handed sword of the Highland warrior, with quillons angled forward.',
    description:
      'Its name means “great sword” in Gaelic. It carries quillons angled toward the point and a wheel pommel, with a long leather-wrapped grip.',
    material: 'Spring steel, wrought iron, leather',
    stories: [{ when: '16th c.', text: 'Highland warriors of Scotland favoured great swords swung with both hands.' }],
  },
  'sw-012': {
    era: 'Arthurian legend',
    summary: 'The king’s sword given by the Lady of the Lake, with a blue gem and golden engraving.',
    description:
      'A decorative replica imagined from the sword of Arthurian legend; the edge is not sharpened. Golden patterns are engraved along the fuller, with golden quillons curling toward the point and a blue gem in the pommel.',
    material: 'Stainless steel (unsharpened), gilded brass, glass gem',
    stories: [
      {
        when: 'Legend',
        text: 'Tales tell both of a boy who became king by drawing a sword from the stone and of a sword received from the lake.',
      },
      {
        when: 'Legend',
        text: 'As the king lay dying, the sword was returned to the lake, and a hand rose from the water to take it.',
      },
    ],
  },
  'sw-013': {
    era: 'The Song of Roland',
    summary: 'Roland’s sword, said not to break even when struck against rock.',
    description:
      'A decorative replica imagined from the sword in The Song of Roland; the edge is not sharpened. It carries a golden crossguard and a red gem in the pommel.',
    material: 'Stainless steel (unsharpened), gilded brass, glass gem',
    stories: [
      {
        when: 'Legend',
        text: 'Roland struck it against a rock to keep it from his enemies, but the sword did not break; the rock split instead.',
      },
    ],
  },
  'sw-014': {
    era: 'Völsunga saga',
    summary: 'Sigurd’s sword, reforged from its broken pieces to slay a dragon.',
    description:
      'A decorative replica imagined from the sword of Norse heroic legend; the edge is not sharpened. Shipped from a fictional workshop in the United States, with rune-like patterns engraved along the fuller.',
    material: 'Pattern-welded steel (unsharpened), bronze, gold wire',
    stories: [
      {
        when: 'Legend',
        text: 'Only Sigmund could draw the sword Odin had thrust into a tree; later his son Sigurd reforged its broken pieces.',
      },
      { when: 'Legend', text: 'Sigurd is said to have slain the dragon Fáfnir with this sword.' },
    ],
  },
  'sw-015': {
    era: 'Greek mythology',
    summary: 'The sickle-shaped sword with which Perseus beheaded Medusa.',
    description:
      'A decorative replica imagined from the sickle-sword of Greek myth; the edge is not sharpened. A hook rises beside the straight blade.',
    material: 'Bronze alloy (unsharpened), leather',
    stories: [{ when: 'Myth', text: 'Perseus is said to have beheaded Medusa with this sword, a gift from Hermes.' }],
  },
  'sw-016': {
    era: 'Japanese mythology',
    summary: 'The grass-cutting sword said to come from the tail of an eight-headed serpent.',
    description:
      'A decorative replica imagined from the sword of Japanese myth; the edge is not sharpened. Following ancient straight swords, it has a straight double edge and a round ring pommel.',
    material: 'Iron (unsharpened), gilt bronze fittings',
    stories: [
      {
        when: 'Myth',
        text: 'When Susanoo slew the great eight-headed serpent, this sword is said to have come from its tail.',
      },
      {
        when: 'Myth',
        text: 'Its name comes from Yamato Takeru, who survived a grass fire by cutting the grass with this sword.',
      },
    ],
  },
};
