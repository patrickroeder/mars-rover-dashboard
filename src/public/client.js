// immutable global data store

let store = Immutable.Map({
    gallery: Immutable.Map({
        min_photos: 9
    }),
    currentRover: 'Curiosity',
    rovers: Immutable.List([
        Immutable.Map({
            name: 'Opportunity',
            manifest: '',
            photos: Immutable.List([])
        }),
        Immutable.Map({
            name: 'Curiosity',
            manifest: '',
            photos: Immutable.List([])
        }),
        Immutable.Map({
            name: 'Spirit',
            manifest: '',
            photos: Immutable.List([])
        })
    ])
});

// add our markup to the page
const root = document.getElementById('root');

const render = async (root, state) => {
    root.innerHTML = App(state);
    initNav();
};

// create content
const App = (state) => {

    let rovers = state.get('rovers');
    let currentRover = state.get('currentRover');
    let rover = getRover(currentRover);

    return `
    <nav class="navbar has-shadow" role="navigation" aria-label="main navigation">
        <div class="container is-max-widescreen">
            <div class="navbar-brand">
                <div class="navbar-item">
                    <strong>Mars Rover Dashboard</strong>
                </div>
                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
                    data-target="roverNavigation">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            ${RoverNavigation(NavItems, rovers)}
        </div>
    </nav>

    <section class="section">
        <div class="container is-max-widescreen">
        <div class="columns">
        <div class="column" id="information">
            ${RoverInformation(rover)}
        </div>
        <div class="column is-three-quarters" id="gallery">
            ${RoverGallery(GalleryItems, rover)}
        </div>
      </div>
        </div>
    </section>
    
    <footer class="footer">
            ${Footer()}
    </footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

const initNav = () => {
    // Get the parent div element
    const parentDiv = document.getElementById('roverNavigation');
    // Get all the anchor tags inside the parent div and convert them into an array
    const anchorTags = Array.from(parentDiv.getElementsByTagName('a'));
    // Attach event listeners to each anchor tag using map()
    anchorTags.map(anchor => {
        anchor.addEventListener('click', function() {
            const roverName = this.textContent.trim();
            // update store
            updateCurrentRover(roverName);
        });
    });
}

// ------------------------------------------------------  COMPONENTS


const RoverNavigation = (NavItems, rovers) => {
    return `
    <div class="navbar-menu" id="roverNavigation">
        <div class="navbar-start">
            ${NavItems(rovers)}
        </div>
    </div>
    `;
};

const NavItems = (rovers) => {
    let navItems = rovers.map((rover) => {
        return `<a class="navbar-item">
            ${rover.toJS().name}
        </a>`
    });
    return navItems.join('');
}

const RoverInformation = (rover) => {
    const manifest = rover.get('manifest');
    if (!manifest) {
        getManifest(rover);
    }
    return `
        <h1 class="title">
            ${manifest.name} &nbsp; <span class="tag is-primary is-medium">${manifest.status}</span>
        </h1>
        <div class="box">
            <div>
                <p class="heading">Launch date</p>
                <p class="title">${manifest.launch_date}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Landing Date</p>
                <p class="title">${manifest.landing_date}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Total Photos</p>
                <p class="title">${manifest.total_photos}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Last photo taken</p>
                <p class="title">${manifest.max_date}</p>
            </div>
        </div>
    `;
};

const RoverGallery = (GalleryItems, rover) => {
    const photos = rover.get('photos');
    const manifest = rover.get('manifest');

    if (photos.isEmpty()) {
        getPhotos(rover, manifest.max_sol);
    }

    return `
    <div class="columns is-multiline">
        ${GalleryItems(photos)}
    </div>
    `;
};

const GalleryItems = (photos) => {
    let photoItems = photos.map((photo) => {
        return `<div class="column is-one-third">
            <figure class="image is-4by3">
                <img src="${photo.img_src}">
            </figure>
            <span class="is-size-7">Taken on: ${photo.earth_date}</span> <span class="tag is-light">${photo.camera.name}</span>
        </div>`;
    });
    return photoItems.join('');
}

const Footer = () => {
    return `
        <div class="container is-max-widescreen">
            Student Project by Patrick Roeder
        </div>`;
}

// Store Management

// Retrieves rovers from store and updates the data of a specific rover. Finally, renders output anew
const updateRoverData = (rover, key, data) => {
    const rovers = store.get('rovers');
    const index = rovers.findIndex(r => r.get('name') === rover.get('name'));
    const updatedRover = rovers.setIn([index, key], data);
    store = store.set('rovers', updatedRover);
    console.log(store.toJS());
}

const appendRoverData = (rover, key, data) => {
    const rovers = store.get('rovers');
    const index = rovers.findIndex(r => r.get('name') === rover.get('name'));

    // merge original and new array
    const original = rovers.get(index).get(key);
    const merged = original.merge(data);
    // console.dir(mergedPhotos.toJS());

    const updatedRover = rovers.setIn([index, key], merged);
    store = store.set('rovers', updatedRover);
    console.log(store.toJS());
}

// Sets the current rover. Finally, renders output anew
const updateCurrentRover = (roverName) => {
    store = store.set('currentRover', roverName);
    console.log('Current Rover: ', roverName);
    render(root, store);
}

const getRover = (name) => {
    let rovers = store.get('rovers');
    let index = rovers.findIndex(r => r.get('name') === name);
    return rovers.get(index);
}

// ------------------------------------------------------  API CALLS

const getManifest = (rover) => {

    fetch(`http://localhost:3000/manifest/${rover.get('name')}`)
        .then(res => res.json())
        .then(manifest => {
            console.log(`Got manifest for ${rover.get('name')}`);
            // update store with new manifest
            updateRoverData(rover, 'manifest', manifest);
            render(root, store);
        });

    return data;
};

const getPhotos = (rover, sol) => {
    fetch(`http://localhost:3000/photos/${rover.get('name')}/${sol}`)
        .then(res => res.json())
        .then(photos => {
            console.log(`Got photos for ${rover.get('name')} and sol ${sol}: ${photos.length}`);
            // update store with new photos
            
            appendRoverData(getRover(rover.get('name')), 'photos', photos);
            console.log('List length: ' + getRover(rover.get('name')).get('photos').toJS().length);

            if (getRover(rover.get('name')).get('photos').toJS().length < store.get('gallery').get('min_photos')) {
                // recursively get more photos until min_photos is reached
                getPhotos(getRover(rover.get('name')), sol - 1);
            }

            render(root, store);
        });

    return data;
}
