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

const getPlaceDetails = async (placeId) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    
    if (!apiKey) {
        console.error('Error: Google Maps API key is required. Please check your .env file.');
        return null;
    }
    
    try {
        const response = await fetch(`${baseUrl}?place_id=${placeId}&fields=editorial_summary&key=${apiKey}`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
            return data.result.editorial_summary?.overview || null;
        } else {
            console.error('No results found or error occurred:', data.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
};

const processPlaces = async () => {
    try {
        // Fetch places from Supabase that have a place_id but no description
        const { data: places, error } = await supabase
            .from('places')
            .select('*')
            .not('place_id', 'is', null)
            .is('description', null);

        if (error) {
            throw error;
        }

        console.log(`Found ${places.length} places to process`);

        // Process each place
        for (const place of places) {
            console.log(`Processing place: ${place.name}`);
            
            const editorialSummary = await getPlaceDetails(place.place_id);
            
            if (editorialSummary) {
                // Update the place in Supabase with the editorial summary
                const { error: updateError } = await supabase
                    .from('places')
                    .update({ description: editorialSummary })
                    .eq('id', place.id);

                if (updateError) {
                    console.error(`Error updating place ${place.id}:`, updateError);
                } else {
                    console.log(`Successfully updated place ${place.id} with description`);
                }
            } else {
                console.log(`No editorial summary found for place ${place.id}`);
            }

            // Add a small delay to avoid hitting API rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('Finished processing all places');
    } catch (error) {
        console.error('Error processing places:', error);
    }
};

// Run the script
processPlaces();

// Export the functions if using in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getPlaceDetails, processPlaces };
} 