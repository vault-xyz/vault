const genMockData = db => {
    if (!db) {
        throw new AppError('Missing db param!');
    }

    db.clear();

    // Person x 2 knows
    {
        const alexis = db.save('people', {
            '@type': 'Person',
            familyName: 'Tyler',
            givenName: 'Alexis',
            knows: []
        });

        const lisa = db.save('people', {
            '@type': 'Person',
            familyName: 'Bridger',
            givenName: 'Lisa',
            knows: [alexis.id]
        });

        db.update('people', alexis.id, {
            knows: [lisa.id]
        });
    }

    // Person + Movie
    {
        const johnMcTiernan = db.save('people', {
            '@type': 'Person',
            familyName: 'McTiernan',
            givenName: 'John'
        });

        db.save('movies', {
            '@type': 'Movie',
            name: 'Die Hard',
            genre: 'Action',
            directors: [johnMcTiernan.id],
            actors: [],
            // Taken from tvdb
            description: `John McClane, officer of the NYPD, tries to save wife Holly Gennaro and several others, taken hostage by German terrorist Hans Gruber during a Christmas party at the Nakatomi Plaza in Los Angeles.`
        });
    }

    // Person + Show + Episode
    {
        const danCastellaneta = db.save('people', {
            '@type': 'Person',
            familyName: 'Castellaneta',
            givenName: 'Dan'
        });

        const theSimpsons = db.save('shows', {
            '@type': 'Show',
            name: 'The Simpsons',
            genre: 'Comedy (Animation)',
            directors: [],
            actors: [danCastellaneta.id],
            // Taken from tvdb
            description: `Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.`
        });

        const seasonOne = db.save('seasons', {
            '@type': 'Season',
            seasonNumber: 1,
            partOfShow: theSimpsons.id
        });

        const episodeOne = db.save('episodes', {
            '@type': 'Episode',
            name: 'Simpsons Roasting on an Open Fire',
            episodeNumber: 1,
            partOfShow: theSimpsons.id,
            partOfSeason: seasonOne.id,
            // Taken from tvdb
            description: `When his Christmas bonus is cancelled, Homer becomes a department-store Santa--and then bets his meager earnings at the track. When all seems lost, Homer and Bart save Christmas by adopting the losing greyhound, Santa's Little Helper.`
        });

        // Add episodeOne to the season
        db.update('seasons', seasonOne.id, {
            episodes: [episodeOne.id]
        });

        // Add seasonOne and epsiodeOne to the show
        db.update('shows', theSimpsons.id, {
            episodes: [episodeOne.id],
            seasons: [seasonOne.id]
        });
    }

    // VideoGame
    {
        const xboxOne = db.save('consoles', {
            '@type': 'VideoGameConsole',
            name: 'Xbox One',
            releaseDate: new Date('November 22, 2013')
        });

        const farCry4 = db.save('games', {
            '@type': 'VideoGame',
            name: 'Far Cry 4',
            playMode: ['CoOp', 'MultiPlayer', 'SinglePlayer'],
            numberOfPlayers: {
                minValue: 1,
                maxValue: 2
            },
            gamePlatform: [xboxOne.id]
        });
    }
};

module.exports = genMockData;