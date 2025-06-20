obs           = obslua
local json    = require("dkjson")

-- CONFIGURATION
local API_KEY      = "YOUR_OPENWEATHERMAP_API_KEY"
local CITY         = "London"
local COUNTRY_CODE = "GB"
local TEXT_SOURCE  = "WeatherText" -- Name of your OBS text source

function get_weather()
    local url = string.format(
        "http://api.openweathermap.org/data/2.5/weather?q=%s,%s&appid=%s&units=metric",
        CITY, COUNTRY_CODE, API_KEY
    )
    local handle = io.popen('curl -s "' .. url .. '"')
    if not handle then
        return nil, "Failed to execute curl"
    end
    local body = handle:read("*a")
    handle:close()
    if not body or body == "" then
        return nil, "Empty response from curl"
    end
    local data, pos, err = json.decode(body, 1, nil)
    if not data then
        return nil, "JSON decode error: " .. tostring(err)
    end
    return data
end

function format_weather(data)
    local desc = data.weather[1].description
    local temp = data.main.temp
    local city = data.name
    return string.format("Weather in %s: %s, %.1f°C", city, desc, temp)
end

function update_obs_text(text)
    local source = obs.obs_get_source_by_name(TEXT_SOURCE)
    if source ~= nil then
        local settings = obs.obs_data_create()
        obs.obs_data_set_string(settings, "text", text)
        obs.obs_source_update(source, settings)
        obs.obs_data_release(settings)
        obs.obs_source_release(source)
    end
end

function script_tick(seconds)
    local data, err = get_weather()
    if data then
        local text = format_weather(data)
        update_obs_text(text)
    else
        update_obs_text("Weather unavailable")
    end
end

function script_description()
    return "Fetches weather from OpenWeatherMap and updates an OBS text source."
end

function script_properties()
    local props = obs.obs_properties_create()
    obs.obs_properties_add_text(props, "api_key", "API Key", obs.OBS_TEXT_PASSWORD)
    obs.obs_properties_add_text(props, "city", "City", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "country_code", "Country Code", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "text_source", "Text Source Name", obs.OBS_TEXT_DEFAULT)
    return props
end

function script_update(settings)
    API_KEY      = obs.obs_data_get_string(settings, "api_key")
    CITY         = obs.obs_data_get_string(settings, "city")
    COUNTRY_CODE = obs.obs_data_get_string(settings, "country_code")
    TEXT_SOURCE  = obs.obs_data_get_string(settings, "text_source")
end