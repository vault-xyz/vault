import { db } from '../../db';

export const resolver = {
    Query: {
        audiobook(parent, { id }, ctx, info) {
            return db.findOneById('audio_book', id);
        },
        audiobooks(parent, args, ctx, info) {
            return db.find('audio_book');
        }
    },
    Mutation: {
        deleteAudioBook: (parent, { id }, ctx, info) => {
            return db.delete('audio_book', id);
        },
        createAudioBook: (parent, { data }, ctx, info) => {
            const { abridged, bookEdition, isbn, numberOfPages, description, disambiguatingDescription, name, alternateNames, sameAs } = data;
            return db.insert('audio_book', {
                abridged,
                bookEdition,
                isbn,
                numberOfPages,
                description,
                disambiguatingDescription,
                name,
                alternateNames,
                sameAs
            });
        },
        updateAudioBook: (parent, { id, data }, ctx, info) => {}
    },
    AudioBook: {}
};