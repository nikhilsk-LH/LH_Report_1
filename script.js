document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const landingSection = document.getElementById('landing-section');
    const rescheduleSection = document.getElementById('reschedule-section');
    const mainHeader = document.querySelector('.main-header');

    const btnReschedule = document.getElementById('btn-reschedule');
    const backButtons = document.querySelectorAll('.btn-back');

    // Thank You Page Elements
    const thankyouSection = document.getElementById('thankyou-section');
    const btnHome = document.getElementById('btn-home');

    // Navigation Logic
    function showSection(sectionToShow) {
        // Hide all
        landingSection.classList.add('hidden');
        rescheduleSection.classList.add('hidden');
        thankyouSection.classList.add('hidden');

        // Hide header on form views, show on landing
        if (sectionToShow === landingSection) {
            mainHeader.classList.remove('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }

        // Show target
        sectionToShow.classList.remove('hidden');

        // Re-trigger animations
        const animatedElements = sectionToShow.querySelectorAll('.slide-up, .fade-in');
        animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; /* trigger reflow */
            el.style.animation = null;
        });
    }

    function showLanding() {
        showSection(landingSection);
    }

    // Event Listeners
    btnReschedule.addEventListener('click', () => {
        showSection(rescheduleSection);
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLanding();
        });
    });

    btnHome.addEventListener('click', () => {
        showLanding();
    });

    // Form Submissions
    // Add Driver Button Logic
    const btnAddDriver = document.getElementById('btn-add-driver');
    const driver2 = document.getElementById('driver-2');
    const driver3 = document.getElementById('driver-3');

    if (btnAddDriver) {
        btnAddDriver.addEventListener('click', () => {
            if (driver2.classList.contains('hidden')) {
                driver2.classList.remove('hidden');
            } else if (driver3.classList.contains('hidden')) {
                driver3.classList.remove('hidden');
                btnAddDriver.style.display = 'none'; // Hide button after adding max drivers
            }
        });
    }

    // Form Submissions
    document.getElementById('form-reschedule').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        // Google Forms Action URL
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf2_-oxjupMblR_2yOunYZkkGPpKLyicq52Wy7S83S-Fne7Gg/formResponse';

        // 1. Collect Common Data
        const commonData = {
            'entry.1434803416': document.getElementById('r-your-name').value, // Your Name
            'entry.1739884741': document.getElementById('r-facility').value, // Facility
            'entry.518069798': document.getElementById('r-moved-to').value,  // Moved To
            'entry.1701004695': document.getElementById('r-slack').value,    // Slack ID
            'entry.1090375788': document.getElementById('r-comments').value // Comments
        };

        // 2. Identify Visible Drivers
        const drivers = [];
        const driverBlocks = document.querySelectorAll('.driver-block');

        driverBlocks.forEach(block => {
            if (!block.classList.contains('hidden')) {
                const driverNameInput = block.querySelector('.d-name');
                const reasonInput = block.querySelector('.d-reason');
                const deliveriesInput = block.querySelector('.d-deliveries');
                const pickupsInput = block.querySelector('.d-pickups');

                // Ensure driver name is filled (it's required in first block, but check others)
                if (driverNameInput.value.trim() !== "") {
                    drivers.push({
                        'entry.1468240365': driverNameInput.value,           // Driver Name
                        'entry.6927900': reasonInput.value,                  // Reason
                        'entry.835758498': deliveriesInput.value || "0",     // Deliveries
                        'entry.1669061386': pickupsInput.value || "0"        // Pickups
                    });
                }
            }
        });

        try {
            // 3. Loop and Send Requests
            const submissionPromises = drivers.map(driverData => {
                const formData = new FormData();

                // Add Common Data
                for (const [key, value] of Object.entries(commonData)) {
                    formData.append(key, value);
                }

                // Add Driver Data
                for (const [key, value] of Object.entries(driverData)) {
                    formData.append(key, value);
                }

                return fetch(GOOGLE_FORM_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                });
            });

            await Promise.all(submissionPromises);

            // Assume success if no network error
            showSection(thankyouSection);
            form.reset();

            // Reset Driver Visibility
            driver2.classList.add('hidden');
            driver3.classList.add('hidden');
            btnAddDriver.style.display = 'inline-block';

        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

});
