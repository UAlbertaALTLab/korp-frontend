settings.corpora = {};
settings.corporafolders = {};

// settings.corporafolders.sweac = {
//     title: "Akademiska texter",
//     contents: ["sweachum", "sweacsam"],
//     description: "A description"
// };

settings.corporafolders.crk = {
    title : "nêhiyawêwin (Plains Cree) texts",
    contents : ["wolfart_ahenakew"]
};

/*
 * PRESELECTED CORPORA
 * Folders will be expanded to all corpora. Optionally prefix folders with __ , which will be ignored.
 */
settings.preselectedCorpora = ["wolfart_ahenakew"];


// settings.corpora["magmakolumner"] = {
//     id: "magmakolumner",
//     title: "Magma kolumner 2009–2012",
//     description: "Material ur kolumner publicerade av <a target=\"_blank\" href=\"http://www.magma.fi\">Tankesmedjan Magma</a>",
//     within: spWithin,
//     context: spContext,
//     attributes: modernAttrs,
//     structAttributes: {
//         text_author: {label: "author"},
//         text_title: {label: "title"},
//         text_date: {label: "date"}
//     }
// };

settings.corpora["wolfart_ahenakew"] = {
        id : "wolfart_ahenakew",
        title : "Ahenakew-Wolfart Texts",
        description : "Plains Cree texts compiled and edited by H. C. Wolfart and Freda Ahenakew",
        // limited_access : true, // This will be invoked once we get basic search functionality working
        within : settings.defaultWithin, // According to Korp Frontend specs
        context : settings.spContext, // According to Korp Frontend specs
        attributes : {
                msd : attrs.msd,
                gloss : attrs.gloss, // This may need to be specified some/elsewhere, as it is ALTLab-specific
                lemma : attrs.baseform,
                dep : attrs.dep,
        },
        structAttributes : {
                text_author : {label : "author"},
                text_title : {label : "title"},
                text_title1 : {label : "text_title1"},
                text_title2 : {label : "text_title2"},
                text_lang : {label : "lang"},
                /* text_url : {label : "url"}, */
        }



};


settings.corpusListing = new CorpusListing(settings.corpora);
