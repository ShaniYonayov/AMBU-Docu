document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('#main-nav ul li a');
    const pageSections = document.querySelectorAll('.page-section');

    // Trip Form Elements
    const tripForm = document.getElementById('trip-form');
    const tripIdInput = document.getElementById('trip-id');
    const driverNameSelect = document.getElementById('driver-name');
    const institutionNameSelect = document.getElementById('institution-name');
    const bookerDetailsInput = document.getElementById('booker-details');
    const patientNameInput = document.getElementById('patient-name');
    const patientIdInput = document.getElementById('patient-id');
    const tripDateInput = document.getElementById('trip-date');
    const tripTimeInput = document.getElementById('trip-time');
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const tripPhotosInput = document.getElementById('trip-photos');
    const photosPreviewArea = document.getElementById('photos-preview-area');
    const openCameraButton = document.getElementById('open-camera-btn');
    const cameraContainer = document.getElementById('camera-container');
    const cameraFeed = document.getElementById('camera-feed');
    const capturePhotoButton = document.getElementById('capture-photo-btn');
    const closeCameraButton = document.getElementById('close-camera-btn');
    const startRecordingBtn = document.getElementById('start-recording-btn');
    const stopRecordingBtn = document.getElementById('stop-recording-btn');
    const recordingStatus = document.getElementById('recording-status');
    const audioPreviewArea = document.getElementById('audio-preview-area');
    const priceFieldContainer = document.getElementById('price-field-container');
    const tripPriceInput = document.getElementById('trip-price');
    const isTripCompletedCheckbox = document.getElementById('is-trip-completed');
    const tripNotesInput = document.getElementById('trip-notes');

    // Trip List Elements
    const tripTableBody = document.querySelector('#trip-table tbody');
    const filterSortHeader = document.getElementById('filter-sort-header');
    const toggleFilterSortBtn = document.querySelector('#filter-sort-header .toggle-filter-sort-btn');
    const filterSortSection = document.getElementById('filter-sort-section');
    const filterDriverSelect = document.getElementById('filter-driver');
    const filterInstitutionSelect = document.getElementById('filter-institution');
    const filterDateFromInput = document.getElementById('filter-date-from');
    const filterDateToInput = document.getElementById('filter-date-to');
    const filterCompletedSelect = document.getElementById('filter-completed');
    const filterSearchTextInput = document.getElementById('filter-search-text');
    const applyFilterBtn = document.getElementById('apply-filter');
    const clearFilterBtn = document.getElementById('clear-filter');
    const sortOptions = document.querySelectorAll('input[name="sort-by"]');

    // Driver Management Elements
    const addDriverBtn = document.getElementById('add-driver-btn');
    const addDriverFormContainer = document.getElementById('add-driver-form-container');
    const addDriverForm = document.getElementById('add-driver-form');
    const newDriverNameInput = document.getElementById('new-driver-name');
    const driverList = document.getElementById('driver-list');
    const cancelAddDriverBtn = addDriverFormContainer ? addDriverFormContainer.querySelector('.cancel-add-btn') : null;


    // Institution Management Elements
    const addInstitutionBtn = document.getElementById('add-institution-btn');
    const addInstitutionFormContainer = document.getElementById('add-institution-form-container');
    const addInstitutionForm = document.getElementById('add-institution-form');
    const newInstitutionNameInput = document.getElementById('new-institution-name');
    const institutionList = document.getElementById('institution-list');
    const cancelAddInstitutionBtn = addInstitutionFormContainer ? addInstitutionFormContainer.querySelector('.cancel-add-btn') : null;


    // Global variables for data storage (using localStorage for simplicity)
    let trips = JSON.parse(localStorage.getItem('trips')) || [];
    let drivers = JSON.parse(localStorage.getItem('drivers')) || ['אבי נהג', 'בני נהג']; // Default drivers
    let institutions = JSON.parse(localStorage.getItem('institutions')) || ['איכילוב', 'אסותא']; // Default institutions
    let currentEditTripId = null; // To track which trip is being edited

    // Camera and Audio variables
    let mediaRecorder;
    let audioChunks = [];
    let stream;
    let capturedPhotos = [];

    // --- Utility Functions ---

    // Function to generate a unique ID
    function generateUniqueId() {
        return 'TRIP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    // Function to save data to localStorage
    function saveData() {
        localStorage.setItem('trips', JSON.stringify(trips));
        localStorage.setItem('drivers', JSON.stringify(drivers));
        localStorage.setItem('institutions', JSON.stringify(institutions));
    }

    // Function to display a specific page section
    function showSection(targetId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
        // Close nav menu on section change
        mainNav.classList.remove('active');
        navToggleBtn.classList.remove('active'); // Also update hamburger icon state

        // Special handling for trip-form-section to reset and set default date/time
        if (targetId === 'trip-form-section') {
            resetTripForm();
            setDefaultDateTime(); // Set current date and time
        } else {
            // Ensure forms are hidden when navigating away from management sections
            if (addDriverFormContainer) addDriverFormContainer.style.display = 'none';
            if (addDriverBtn) addDriverBtn.style.display = 'block';
            if (addInstitutionFormContainer) addInstitutionFormContainer.style.display = 'none';
            if (addInstitutionBtn) addInstitutionBtn.style.display = 'block';
        }
    }

    // Set default date and time
    function setDefaultDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        tripDateInput.value = `${year}-${month}-${day}`;
        tripTimeInput.value = `${hours}:${minutes}`;
    }


    // Populate select dropdowns for drivers and institutions
    function populateSelects() {
        [driverNameSelect, filterDriverSelect].forEach(select => {
            if (select) { // Check if element exists
                // Preserve selected value if any
                const currentValue = select.value;
                select.innerHTML = '<option value="">בחר נהג</option>';
                drivers.forEach(driver => {
                    const option = document.createElement('option');
                    option.value = driver;
                    option.textContent = driver;
                    select.appendChild(option);
                });
                select.value = currentValue; // Restore selected value
            }
        });

        [institutionNameSelect, filterInstitutionSelect].forEach(select => {
            if (select) { // Check if element exists
                // Preserve selected value if any
                const currentValue = select.value;
                select.innerHTML = '<option value="">בחר מוסד</option>';
                institutions.forEach(institution => {
                    const option = document.createElement('option');
                    option.value = institution;
                    option.textContent = institution;
                    select.appendChild(option);
                });
                select.value = currentValue; // Restore selected value
            }
        });
    }

    // Render Driver List
    function renderDriverList() {
        if (!driverList) return; // Exit if element doesn't exist
        driverList.innerHTML = '';
        drivers.forEach(driver => {
            const listItem = document.createElement('li');
            listItem.classList.add('management-list-item');
            listItem.innerHTML = `
                <span>${driver}</span>
                <button type="button" class="delete-item-btn" data-item="${driver}" data-type="driver">מחק</button>
            `;
            driverList.appendChild(listItem);
        });
    }

    // Render Institution List
    function renderInstitutionList() {
        if (!institutionList) return; // Exit if element doesn't exist
        institutionList.innerHTML = '';
        institutions.forEach(institution => {
            const listItem = document.createElement('li');
            listItem.classList.add('management-list-item');
            listItem.innerHTML = `
                <span>${institution}</span>
                <button type="button" class="delete-item-btn" data-item="${institution}" data-type="institution">מחק</button>
            `;
            institutionList.appendChild(listItem);
        });
    }

    // --- Trip Management Functions ---

    function renderTrips(filteredTrips = trips) {
        if (!tripTableBody) return; // Exit if element doesn't exist
        tripTableBody.innerHTML = '';

        // Apply sorting
        const sortBy = document.querySelector('input[name="sort-by"]:checked')?.value || 'date-desc';
        let sortedTrips = [...filteredTrips]; // Create a copy to sort

        switch (sortBy) {
            case 'date-desc':
                sortedTrips.sort((a, b) => new Date(b.tripDate + ' ' + b.tripTime) - new Date(a.tripDate + ' ' + a.tripTime));
                break;
            case 'date-asc':
                sortedTrips.sort((a, b) => new Date(a.tripDate + ' ' + a.tripTime) - new Date(b.tripDate + ' ' + b.tripTime));
                break;
            case 'driver':
                sortedTrips.sort((a, b) => a.driverName.localeCompare(b.driverName));
                break;
            case 'institution':
                sortedTrips.sort((a, b) => a.institutionName.localeCompare(b.institutionName));
                break;
        }

        sortedTrips.forEach(trip => {
            const row = tripTableBody.insertRow();
            row.dataset.id = trip.id; // Store trip ID on the row

            const completedStatus = trip.isCompleted ?
                `<button type="button" class="toggle-completed-btn" title="הפוך לממתין"><i class="fas fa-check-circle completed-icon"></i></button>` :
                `<button type="button" class="toggle-completed-btn" title="השלם נסיעה"><i class="fas fa-hourglass-half pending-icon"></i></button>`;


            row.innerHTML = `
                <td>${completedStatus}</td>
                <td>${trip.tripId}</td>
                <td>${trip.tripDate}</td>
                <td>${trip.tripTime}</td>
                <td>${trip.driverName}</td>
                <td>${trip.institutionName}</td>
                <td>${trip.bookerDetails}</td>
                <td>${trip.patientName}</td>
                <td>${trip.patientId || ''}</td>
                <td>${trip.origin}</td>
                <td>${trip.destination}</td>
                <td>${trip.tripPrice ? trip.tripPrice + ' ₪' : 'אין'}</td>
                <td>${trip.tripNotes || ''}</td>
                <td class="action-icons">
                    ${trip.audioRecording ? `<i class="fas fa-volume-up audio-play-icon" title="נגן הקלטה" data-audio="${trip.audioRecording}"></i>` : ''}
                    ${trip.photos && trip.photos.length > 0 ? `<i class="fas fa-camera view-photos-icon" title="צפה בתמונות" data-photos="${trip.photos.join(',')}"></i>` : ''}
                    <i class="fas fa-edit edit-icon" title="ערוך נסיעה"></i>
                    <i class="fas fa-trash-alt delete-icon" title="מחק נסיעה"></i>
                </td>
            `;

            // Add event listeners for new elements in the row
            const toggleBtn = row.querySelector('.toggle-completed-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => toggleTripCompletion(trip.id));
            }
            const editIcon = row.querySelector('.edit-icon');
            if (editIcon) {
                editIcon.addEventListener('click', () => editTrip(trip.id));
            }
            const deleteIcon = row.querySelector('.delete-icon');
            if (deleteIcon) {
                deleteIcon.addEventListener('click', () => deleteTrip(trip.id));
            }
            const audioPlayIcon = row.querySelector('.audio-play-icon');
            if (audioPlayIcon) {
                audioPlayIcon.addEventListener('click', (e) => playAudioRecording(e.target.dataset.audio, row));
            }
            const viewPhotosIcon = row.querySelector('.view-photos-icon');
            if (viewPhotosIcon) {
                viewPhotosIcon.addEventListener('click', (e) => viewTripPhotos(e.target.dataset.photos.split(','), row));
            }
        });
    }

    function saveTrip(event) {
        event.preventDefault();

        const newTrip = {
            id: currentEditTripId || generateUniqueId(),
            tripId: tripIdInput.value,
            driverName: driverNameSelect.value,
            institutionName: institutionNameSelect.value,
            bookerDetails: bookerDetailsInput.value,
            patientName: patientNameInput.value,
            patientId: patientIdInput.value,
            tripDate: tripDateInput.value,
            tripTime: tripTimeInput.value,
            origin: originInput.value,
            destination: destinationInput.value,
            tripPrice: priceFieldContainer.style.display === 'block' ? parseFloat(tripPriceInput.value) || 0 : 0,
            isCompleted: isTripCompletedCheckbox.checked,
            tripNotes: tripNotesInput.value,
            photos: capturedPhotos, // Save captured photos
            audioRecording: audioChunks.length > 0 ? URL.createObjectURL(new Blob(audioChunks, { type: 'audio/webm' })) : null // Save audio
        };

        if (currentEditTripId) {
            const index = trips.findIndex(t => t.id === currentEditTripId);
            if (index !== -1) {
                // Revoke old object URLs to prevent memory leaks if editing
                if (trips[index].audioRecording) URL.revokeObjectURL(trips[index].audioRecording);
                if (trips[index].photos) trips[index].photos.forEach(url => URL.revokeObjectURL(url));

                trips[index] = newTrip;
            }
        } else {
            trips.push(newTrip);
        }

        saveData();
        resetTripForm();
        renderTrips(); // Re-render the trip list
        showSection('trip-list-section'); // Go back to trip list after save
    }

    function editTrip(id) {
        const tripToEdit = trips.find(trip => trip.id === id);
        if (tripToEdit) {
            currentEditTripId = id;
            tripIdInput.value = tripToEdit.tripId;
            driverNameSelect.value = tripToEdit.driverName;
            institutionNameSelect.value = tripToEdit.institutionName;
            bookerDetailsInput.value = tripToEdit.bookerDetails;
            patientNameInput.value = tripToEdit.patientName;
            patientIdInput.value = tripToEdit.patientId;
            tripDateInput.value = tripToEdit.tripDate;
            tripTimeInput.value = tripToEdit.tripTime;
            originInput.value = tripToEdit.origin;
            destinationInput.value = tripToEdit.destination;

            // Handle price field visibility during edit
            if (tripToEdit.tripPrice > 0 || (localStorage.getItem('showPriceField') === 'true')) {
                priceFieldContainer.style.display = 'block';
                tripPriceInput.value = tripToEdit.tripPrice;
            } else {
                priceFieldContainer.style.display = 'none';
                tripPriceInput.value = '';
            }

            isTripCompletedCheckbox.checked = tripToEdit.isCompleted;
            tripNotesInput.value = tripToEdit.tripNotes;

            // Handle photos during edit
            capturedPhotos = [];
            photosPreviewArea.innerHTML = '';
            if (tripToEdit.photos && tripToEdit.photos.length > 0) {
                tripToEdit.photos.forEach(photoUrl => {
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('photo-preview');
                    imgContainer.innerHTML = `<img src="${photoUrl}" alt="Trip Photo"><button type="button" class="remove-photo-btn">X</button>`;
                    photosPreviewArea.appendChild(imgContainer);
                    capturedPhotos.push(photoUrl); // Re-add existing photos to current photos array

                    const removeBtn = imgContainer.querySelector('.remove-photo-btn');
                    removeBtn.addEventListener('click', () => {
                        const index = capturedPhotos.indexOf(photoUrl);
                        if (index > -1) {
                            capturedPhotos.splice(index, 1);
                            imgContainer.remove();
                            // Revoke URL if it was created locally
                            if (photoUrl.startsWith('blob:')) URL.revokeObjectURL(photoUrl);
                        }
                    });
                });
            }

            // Handle audio during edit
            audioPreviewArea.innerHTML = '';
            audioChunks = []; // Clear chunks, if re-recording, it will create new
            if (tripToEdit.audioRecording) {
                const audioPlayer = document.createElement('audio');
                audioPlayer.controls = true;
                audioPlayer.src = tripToEdit.audioRecording;
                audioPreviewArea.appendChild(audioPlayer);
                // No need to push to audioChunks for existing blob URL, just play
            }

            showSection('trip-form-section'); // Go to form to edit
            tripIdInput.value = tripToEdit.tripId; // Display trip ID
        }
    }

    function deleteTrip(id) {
        if (confirm('האם אתה בטוח שברצונך למחוק נסיעה זו?')) {
            const index = trips.findIndex(trip => trip.id === id);
            if (index !== -1) {
                // Revoke object URLs before deleting to prevent memory leaks
                if (trips[index].audioRecording) URL.revokeObjectURL(trips[index].audioRecording);
                if (trips[index].photos) trips[index].photos.forEach(url => URL.revokeObjectURL(url));

                trips.splice(index, 1);
                saveData();
                renderTrips(); // Re-render after deletion
            }
        }
    }

    function toggleTripCompletion(id) {
        const trip = trips.find(t => t.id === id);
        if (trip) {
            trip.isCompleted = !trip.isCompleted;
            saveData();
            renderTrips(applyFilters()); // Re-render to update status icon, applying current filters
        }
    }

    function resetTripForm() {
        tripForm.reset();
        tripIdInput.value = generateUniqueId(); // Generate new ID for next trip
        currentEditTripId = null; // Clear edit state
        photosPreviewArea.innerHTML = ''; // Clear photo previews
        capturedPhotos = [];
        audioPreviewArea.innerHTML = ''; // Clear audio previews
        audioChunks = [];
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        recordingStatus.textContent = 'מוכן';
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        setDefaultDateTime(); // Set current date and time on reset
    }

    // --- Filter and Sort Functions ---

    function applyFilters() {
        let filtered = [...trips];

        const driverFilter = filterDriverSelect.value;
        const institutionFilter = filterInstitutionSelect.value;
        const dateFromFilter = filterDateFromInput.value;
        const dateToFilter = filterDateToInput.value;
        const completedFilter = filterCompletedSelect.value;
        const searchTxt = filterSearchTextInput.value.toLowerCase();

        if (driverFilter) {
            filtered = filtered.filter(trip => trip.driverName === driverFilter);
        }
        if (institutionFilter) {
            filtered = filtered.filter(trip => trip.institutionName === institutionFilter);
        }
        if (dateFromFilter) {
            filtered = filtered.filter(trip => trip.tripDate >= dateFromFilter);
        }
        if (dateToFilter) {
            filtered = filtered.filter(trip => trip.tripDate <= dateToFilter);
        }
        if (completedFilter === 'completed') {
            filtered = filtered.filter(trip => trip.isCompleted);
        } else if (completedFilter === 'pending') {
            filtered = filtered.filter(trip => !trip.isCompleted);
        }
        if (searchTxt) {
            filtered = filtered.filter(trip =>
                (trip.patientName && trip.patientName.toLowerCase().includes(searchTxt)) ||
                (trip.bookerDetails && trip.bookerDetails.toLowerCase().includes(searchTxt)) ||
                (trip.origin && trip.origin.toLowerCase().includes(searchTxt)) ||
                (trip.destination && trip.destination.toLowerCase().includes(searchTxt)) ||
                (trip.tripId && trip.tripId.toLowerCase().includes(searchTxt))
            );
        }
        renderTrips(filtered);
        return filtered; // Return filtered list for other uses if needed
    }

    function clearFilters() {
        filterDriverSelect.value = '';
        filterInstitutionSelect.value = '';
        filterDateFromInput.value = '';
        filterDateToInput.value = '';
        filterCompletedSelect.value = '';
        filterSearchTextInput.value = '';
        document.getElementById('sort-date-desc').checked = true; // Reset sort to default
        applyFilters(); // Re-render with cleared filters
    }

    // --- Camera Functions ---

    openCameraButton.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraFeed.srcObject = stream;
            cameraContainer.style.display = 'flex'; // Show the camera feed
            capturePhotoButton.disabled = false; // Enable capture button
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("לא ניתן לגשת למצלמה. ודא שאפשרת גישה או נסה בדפדפן אחר.");
        }
    });

    closeCameraButton.addEventListener('click', () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop all tracks
        }
        cameraContainer.style.display = 'none'; // Hide the camera feed
        capturePhotoButton.disabled = true; // Disable capture button
        cameraFeed.srcObject = null; // Clear video source
    });

    capturePhotoButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraFeed.videoWidth;
        canvas.height = cameraFeed.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png'); // Get image as data URL

        capturedPhotos.push(dataUrl); // Add to array

        // Create preview element
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('photo-preview');
        imgContainer.innerHTML = `<img src="${dataUrl}" alt="Trip Photo"><button type="button" class="remove-photo-btn">X</button>`;
        photosPreviewArea.appendChild(imgContainer);

        // Add remove functionality to the new button
        const removeBtn = imgContainer.querySelector('.remove-photo-btn');
        removeBtn.addEventListener('click', () => {
            const index = capturedPhotos.indexOf(dataUrl);
            if (index > -1) {
                capturedPhotos.splice(index, 1);
                imgContainer.remove();
            }
        });
    });

    // File input for photos
    tripPhotosInput.addEventListener('change', (event) => {
        const files = event.target.files;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    capturedPhotos.push(dataUrl);

                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('photo-preview');
                    imgContainer.innerHTML = `<img src="${dataUrl}" alt="Trip Photo"><button type="button" class="remove-photo-btn">X</button>`;
                    photosPreviewArea.appendChild(imgContainer);

                    const removeBtn = imgContainer.querySelector('.remove-photo-btn');
                    removeBtn.addEventListener('click', () => {
                        const index = capturedPhotos.indexOf(dataUrl);
                        if (index > -1) {
                            capturedPhotos.splice(index, 1);
                            imgContainer.remove();
                        }
                    });
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // --- Audio Recording Functions ---

    startRecordingBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; // Clear previous recordings

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                audioPreviewArea.innerHTML = ''; // Clear previous audio player
                const audioPlayer = document.createElement('audio');
                audioPlayer.controls = true;
                audioPlayer.src = audioUrl;
                audioPreviewArea.appendChild(audioPlayer);

                // No need to store audioUrl in a separate array if we only keep one for the form.
                // The URL is passed directly into the trip object upon save.
            };

            mediaRecorder.start();
            recordingStatus.textContent = 'מקליט...';
            startRecordingBtn.disabled = true;
            stopRecordingBtn.disabled = false;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('לא ניתן לגשת למיקרופון. ודא שאפשרת גישה.');
        }
    });

    stopRecordingBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop microphone stream
        }
        recordingStatus.textContent = 'הקלטה הסתיימה';
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
    });

    function playAudioRecording(audioUrl, rowElement) {
        // Remove any existing audio player rows
        const existingPlaybackRow = rowElement.parentNode.querySelector('.audio-playback-row');
        if (existingPlaybackRow) {
            existingPlaybackRow.remove();
        }

        const playbackRow = tripTableBody.insertRow(rowElement.rowIndex + 1); // Insert below current row
        playbackRow.classList.add('audio-playback-row');
        const cell = playbackRow.insertCell(0);
        cell.colSpan = rowElement.cells.length; // Span all columns

        const audioPlayer = document.createElement('audio');
        audioPlayer.controls = true;
        audioPlayer.autoplay = true; // Autoplay when shown
        audioPlayer.src = audioUrl;
        cell.appendChild(audioPlayer);

        // Remove the audio player when it ends
        audioPlayer.addEventListener('ended', () => {
            playbackRow.remove();
        });
    }

    function viewTripPhotos(photoUrls, rowElement) {
        // Remove any existing photo gallery rows
        const existingGalleryRow = rowElement.parentNode.querySelector('.photo-gallery-row');
        if (existingGalleryRow) {
            existingGalleryRow.remove();
        }

        const galleryRow = tripTableBody.insertRow(rowElement.rowIndex + 1); // Insert below current row
        galleryRow.classList.add('photo-gallery-row');
        const cell = galleryRow.insertCell(0);
        cell.colSpan = rowElement.cells.length; // Span all columns

        photoUrls.forEach(url => {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('gallery-item');
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.objectFit = 'cover';
            img.alt = 'Trip Photo';
            imgContainer.appendChild(img);
            cell.appendChild(imgContainer);
        });

        // Add a button to close the gallery
        const closeGalleryBtn = document.createElement('button');
        closeGalleryBtn.textContent = 'סגור גלריה';
        closeGalleryBtn.classList.add('main-action-button-secondary');
        closeGalleryBtn.style.marginTop = '10px';
        cell.appendChild(closeGalleryBtn);
        closeGalleryBtn.addEventListener('click', () => {
            galleryRow.remove();
        });
    }


    // --- Event Listeners ---

    // Navigation Toggle
    if (navToggleBtn && mainNav) {
        navToggleBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click from immediately closing it
            mainNav.classList.toggle('active');
            navToggleBtn.classList.toggle('active'); // Toggle class for styling (e.g., hamburger to X)
        });

        // Close nav menu if clicked outside
        document.addEventListener('click', (event) => {
            // Check if the click was outside the nav and not on the toggle button
            if (mainNav.classList.contains('active') && !mainNav.contains(event.target) && !navToggleBtn.contains(event.target)) {
                mainNav.classList.remove('active');
                navToggleBtn.classList.remove('active');
            }
        });
    }


    // Nav Links to show/hide sections
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.dataset.target; // Get data-target attribute
            if (targetId) {
                showSection(targetId);
                // Special actions on section switch
                if (targetId === 'trip-list-section') {
                    renderTrips(); // Render all trips when navigating to the list
                } else if (targetId === 'driver-management-section') {
                    renderDriverList();
                } else if (targetId === 'institution-management-section') {
                    renderInstitutionList();
                }
                // The showSection function now handles resetTripForm and setDefaultDateTime
            }
        });
    });

    // Handle form submission for trips
    if (tripForm) {
        tripForm.addEventListener('submit', saveTrip);
    }

    // Handle Add Option Buttons (for Driver and Institution) - Corrected logic
    document.querySelectorAll('.add-option-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetFormId = e.target.dataset.targetForm; // e.g., 'driver-management-section' or 'institution-management-section'
            showSection(targetFormId); // Show the relevant management section

            // Now, specifically for the management sections, show their respective forms
            if (targetFormId === 'driver-management-section' && addDriverFormContainer) {
                if (addDriverBtn) addDriverBtn.style.display = 'none'; // Hide "Add New Driver" button
                addDriverFormContainer.style.display = 'block'; // Show the add driver form
                newDriverNameInput.focus();
            } else if (targetFormId === 'institution-management-section' && addInstitutionFormContainer) {
                if (addInstitutionBtn) addInstitutionBtn.style.display = 'none'; // Hide "Add New Institution" button
                addInstitutionFormContainer.style.display = 'block'; // Show the add institution form
                newInstitutionNameInput.focus();
            }
        });
    });


    // Handle Driver Management
    if (addDriverBtn && addDriverFormContainer) {
        addDriverBtn.addEventListener('click', () => {
            addDriverFormContainer.style.display = 'block';
            addDriverBtn.style.display = 'none';
            newDriverNameInput.focus();
        });
    }
    if (cancelAddDriverBtn && addDriverFormContainer) {
        cancelAddDriverBtn.addEventListener('click', () => {
            addDriverFormContainer.style.display = 'none';
            addDriverBtn.style.display = 'block';
            addDriverForm.reset();
        });
    }
    if (addDriverForm) {
        addDriverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newDriver = newDriverNameInput.value.trim();
            if (newDriver && !drivers.includes(newDriver)) {
                drivers.push(newDriver);
                saveData();
                populateSelects();
                renderDriverList();
                addDriverForm.reset();
                addDriverFormContainer.style.display = 'none';
                addDriverBtn.style.display = 'block';
            } else {
                alert('שם הנהג כבר קיים או שאינו חוקי.');
            }
        });
    }

    // Handle Institution Management
    if (addInstitutionBtn && addInstitutionFormContainer) {
        addInstitutionBtn.addEventListener('click', () => {
            addInstitutionFormContainer.style.display = 'block';
            addInstitutionBtn.style.display = 'none';
            newInstitutionNameInput.focus();
        });
    }
    if (cancelAddInstitutionBtn && addInstitutionFormContainer) {
        cancelAddInstitutionBtn.addEventListener('click', () => {
            addInstitutionFormContainer.style.display = 'none';
            addInstitutionBtn.style.display = 'block';
            addInstitutionForm.reset();
        });
    }
    if (addInstitutionForm) {
        addInstitutionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newInstitution = newInstitutionNameInput.value.trim();
            if (newInstitution && !institutions.includes(newInstitution)) {
                institutions.push(newInstitution);
                saveData();
                populateSelects();
                renderInstitutionList();
                addInstitutionForm.reset();
                addInstitutionFormContainer.style.display = 'none';
                addInstitutionBtn.style.display = 'block';
            } else {
                alert('שם המוסד כבר קיים או שאינו חוקי.');
            }
        });
    }

    // Delete items from management lists (delegation)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-item-btn')) {
            const itemToDelete = e.target.dataset.item;
            const itemType = e.target.dataset.type;
            if (confirm(`האם אתה בטוח שברצונך למחוק את "${itemToDelete}"?`)) {
                if (itemType === 'driver') {
                    drivers = drivers.filter(d => d !== itemToDelete);
                    saveData();
                    populateSelects();
                    renderDriverList();
                } else if (itemType === 'institution') {
                    institutions = institutions.filter(inst => inst !== itemToDelete);
                    saveData();
                    populateSelects();
                    renderInstitutionList();
                }
            }
        }
    });

    // Filter and Sort Event Listeners
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilters);
    }
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearFilters);
    }
    if (filterSortHeader && toggleFilterSortBtn && filterSortSection) {
        filterSortHeader.addEventListener('click', () => {
            filterSortSection.classList.toggle('open');
            toggleFilterSortBtn.textContent = filterSortSection.classList.contains('open') ? 'סגור' : 'פתח';
        });
        // Stop propagation from button click to prevent double toggle
        toggleFilterSortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterSortSection.classList.toggle('open');
            toggleFilterSortBtn.textContent = filterSortSection.classList.contains('open') ? 'סגור' : 'פתח';
        });
    }
    sortOptions.forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    // Initial setup
    populateSelects();
    renderTrips(); // Render initial trips
    tripIdInput.value = generateUniqueId(); // Set initial trip ID
    setDefaultDateTime(); // Set current date and time on load
    showSection('trip-form-section'); // Show the form section by default on load
});