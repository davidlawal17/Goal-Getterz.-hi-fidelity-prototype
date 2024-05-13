const form = document.getElementById('scheduleForm');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const submitButton = document.getElementById('submit');

    window.addEventListener('DOMContentLoaded', () => {
      form.addEventListener('submit', handleFormSubmit);
    });

    function generateSchedule(preferences) {
      // Filter activities based on user's interests, budget, and alcohol preference
      const filteredActivities = footballActivities.filter(activity => {
        const isRestaurantOrPub = activity.type === 'restaurant' || activity.type === 'pub';
        const isAllowed = preferences.interests.includes('pub') || !isRestaurantOrPub;

        return (
          (preferences.interests.includes(activity.type) || preferences.interests.includes('all')) &&
          activity.cost <= preferences.budget &&
          activity.distance.split(' ')[0] <= preferences.distance &&
          isAllowed
        );
      });

      // Sort activities based on location and duration
      filteredActivities.sort((a, b) => {
        // Sort by location (closer to city centre first)
        if (a.location < b.location) return -1;
        if (a.location > b.location) return 1;

        // If locations are the same, sort by duration (shorter duration first)
        return a.duration - b.duration;
      });

      // Create schedule based on stay duration and budget
      const schedule = [];
      let remainingDuration = preferences.duration;
      let remainingBudget = preferences.budget;

      // Include a stadium tour based on the user's preferred team
      let stadiumTour;
      if (preferences.interests.includes('manchester-united')) {
        stadiumTour = footballActivities.find(activity => activity.name === 'Manchester United Stadium Tour');
      } else if (preferences.interests.includes('manchester-city')) {
        stadiumTour = footballActivities.find(activity => activity.name === 'Manchester City Stadium Tour');
      }

      if (stadiumTour) {
        schedule.push(stadiumTour);
        remainingDuration -= stadiumTour.duration;
        remainingBudget -= stadiumTour.cost;
      }

      // Include an activity
      const activity = filteredActivities.find(activity => activity.type === 'activity');
      if (activity) {
        schedule.push(activity);
        remainingDuration -= activity.duration;
        remainingBudget -= activity.cost;
      } else {
        // If no activity is found in the filtered activities, include the first available activity
        const firstActivity = footballActivities.find(activity => activity.type === 'activity');
        if (firstActivity) {
          schedule.push(firstActivity);
          remainingDuration -= firstActivity.duration;
          remainingBudget -= firstActivity.cost;
        }
      }

      // Include a hotel if the user selected "Yes" for hotel
      if (preferences.interests.includes('hotel')) {
        const hotel = filteredActivities.find(activity => activity.type === 'hotel');
        if (hotel) {
          schedule.push(hotel);
          remainingDuration -= hotel.duration;
          remainingBudget -= hotel.cost;
        } else {
          // If no hotel is found in the filtered activities, include the first available hotel
          const firstHotel = footballActivities.find(activity => activity.type === 'hotel');
          if (firstHotel) {
            schedule.push(firstHotel);
            remainingDuration -= firstHotel.duration;
            remainingBudget -= firstHotel.cost;
          }
        }
      }

      // Add remaining activities based on duration and budget
      for (const activity of filteredActivities) {
        if (remainingDuration >= activity.duration && remainingBudget >= activity.cost) {
          schedule.push(activity);
          remainingDuration -= activity.duration;
          remainingBudget -= activity.cost;
        }
      }

      // Adjust hotel cost based on the number of people
      const hotels = schedule.filter(activity => activity.type === 'hotel');
      hotels.forEach(hotel => {
        hotel.cost *= preferences.people;
      });

      return schedule;
    }

    function displaySchedule(schedule) {
      scheduleContainer.innerHTML = '';

      if (schedule.length === 0) {
        scheduleContainer.textContent = 'No activities found based on your preferences.';
        return;
      }

      const scheduleList = document.createElement('div');
      scheduleList.classList.add('schedule-list');

      for (const activity of schedule) {
        const listItem = document.createElement('div');
        listItem.classList.add('schedule-item');

        const activityName = document.createElement('h3');
        activityName.textContent = activity.name;

        const activityDetails = document.createElement('p');
        activityDetails.textContent = `${activity.description} - ${activity.location} (${activity.duration} hours, £${activity.cost})`;

        listItem.appendChild(activityName);
        listItem.appendChild(activityDetails);
        scheduleList.appendChild(listItem);
      }

      scheduleContainer.appendChild(scheduleList);
    }

    function handleFormSubmit(event) {
      event.preventDefault();

      const userPreferences = {
        duration: parseInt(document.getElementById('duration').value),
        budget: parseInt(document.getElementById('budget').value),
        interests: [],
        distance: parseInt(document.getElementById('distance').value)
      };

      // Get the preferred team
      const preferredTeam = document.querySelector('input[name="preferredTeam"]:checked');
      if (preferredTeam) {
        userPreferences.interests.push(preferredTeam.value);
      }

      // Check if hotel is needed
      const hotelNeeded = document.querySelector('input[name="hotel"]:checked');
      if (hotelNeeded && hotelNeeded.value === 'Yes') {
        userPreferences.interests.push('hotel');
      }

      // Check if alcohol is consumed
      const alcoholConsumed = document.querySelector('input[name="Alcohol"]:checked');
      if (alcoholConsumed && alcoholConsumed.value === 'Yes') {
        userPreferences.interests.push('pub');
      }

      // Add the people to the userPreferences object
      userPreferences.people = parseInt(document.getElementById('people').value);

      console.log(userPreferences); // Log the userPreferences object for debugging

      const generatedSchedule = generateSchedule(userPreferences);
      displaySchedule(generatedSchedule);
    }