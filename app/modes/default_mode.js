settings.corpora        = {};
settings.corporafolders = {};

settings.corporafolders.crk = {
  // corpora included in this folder
  contents: [`wolfart_ahenakew`],
  // description for this folder
  // description: `A description,`
  // appears in the corpus selection dropdown for this folder
  title:    `nêhiyawêwin (Plains Cree) texts`,
};

/*
 * PRESELECTED CORPORA
 * Folders will be expanded to all corpora.
 * Optionally prefix folders with __ , which will be ignored.
 */
settings.preselectedCorpora = [`wolfart_ahenakew`];

settings.corpora.wolfart_ahenakew = {

  id:          `wolfart_ahenakew`,
  title:       `Ahenakew-Wolfart Texts`, // displayed in info box under "Corpus"
  description: `Plains Cree texts compiled and edited by H. C. Wolfart and Freda Ahenakew`,
  within:      spWithin,  // from common.js; sp = sentence/paragraph
  context:     spContext, // from common.js; sp = sentence/paragraph

  // attributes are displayed in the info box under "Word attributes"
  attributes:  {
    dep:   attrs.dep,
    gloss: attrs.gloss, // This may need to be specified some/elsewhere, as it is ALTLab-specific
    lemma: attrs.baseform,
    msd:   attrs.msd,
  },

  // structural attributes are displayed in the info box under "Text attributes"
  structAttributes: {
    text_author: { label: `author` },
    text_lang:   { label: `lang` },
    text_title:  { label: `title` },
    text_title1: { label: `text_title1` }, // not sure why we have multiple titles [DWH]
    text_title2: { label: `text_title2` }, // not sure why we have multiple titles [DWH]
  },

};

settings.corpusListing = new CorpusListing(settings.corpora);
