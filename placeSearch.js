// Google Places API Place Search Script with Supabase Integration
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL and key are required. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const searchPlace = async (searchQuery) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    
    if (!apiKey) {
        console.error('Error: Google Maps API key is required. Please check your .env file.');
        return null;
    }
    
    try {
        const response = await fetch(`${baseUrl}?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            const place = data.results[0];
            console.log('Place Name:', place.name);
            console.log('Place ID:', place.place_id);
            return place.place_id;
        } else {
            console.error('No results found or error occurred:', data.status);
            return null;
        }
    } catch (error) {
        console.error('Error searching for place:', error);
        return null;
    }
};

const processPlaces = async () => {
    try {
        // Fetch places from Supabase that don't have a place_id
        const { data: places, error } = await supabase
            .from('places')
            .select('*')
            .is('place_id', null);

        if (error) {
            throw error;
        }

        console.log(`Found ${places.length} places to process`);

        // Process each place
        for (const place of places) {
            const searchQuery = `${place.name}, ${place.address}`;
            console.log(`Searching for: ${searchQuery}`);
            
            const placeId = await searchPlace(searchQuery);
            
            if (placeId) {
                // Update the place in Supabase with the Google Place ID
                const { error: updateError } = await supabase
                    .from('places')
                    .update({ place_id: placeId })
                    .eq('id', place.id);

                if (updateError) {
                    console.error(`Error updating place ${place.id}:`, updateError);
                } else {
                    console.log(`Successfully updated place ${place.id} with Place ID: ${placeId}`);
                }
            }

            // Add a small delay to avoid hitting API rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('Finished processing all places');
    } catch (error) {
        console.error('Error processing places:', error);
    }
};

// Run the process
processPlaces();

// Export the functions if using in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { searchPlace, processPlaces };
} 