-- ScrollingText-Info 5Line.lua
-- OBS Lua script: Combine 5 text inputs with a custom separator for use in a text source

obs           = obslua
source_name   = ""
text1         = ""
text2         = ""
text3         = ""
text4         = ""
text5         = ""
separator     = " | "

function script_description()
    return "Combine 5 text inputs with a custom separator for use in a text source."
end

function script_properties()
    local props = obs.obs_properties_create()
    obs.obs_properties_add_text(props, "source_name", "Text Source Name", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "text1", "Text 1", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "text2", "Text 2", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "text3", "Text 3", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "text4", "Text 4", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "text5", "Text 5", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "separator", "Separator Text", obs.OBS_TEXT_DEFAULT)
    return props
end

function script_update(settings)
    source_name = obs.obs_data_get_string(settings, "source_name")
    text1 = obs.obs_data_get_string(settings, "text1")
    text2 = obs.obs_data_get_string(settings, "text2")
    text3 = obs.obs_data_get_string(settings, "text3")
    text4 = obs.obs_data_get_string(settings, "text4")
    text5 = obs.obs_data_get_string(settings, "text5")
    separator = obs.obs_data_get_string(settings, "separator")

    update_text_source()
end

function update_text_source()
    if source_name == "" then return end

    local texts = {}
    if text1 ~= "" then table.insert(texts, text1) end
    if text2 ~= "" then table.insert(texts, text2) end
    if text3 ~= "" then table.insert(texts, text3) end
    if text4 ~= "" then table.insert(texts, text4) end
    if text5 ~= "" then table.insert(texts, text5) end

    local combined = table.concat(texts, separator)
    if #texts > 0 then
        combined = separator .. combined
    end

    local source = obs.obs_get_source_by_name(source_name)
    if source ~= nil then
        local settings = obs.obs_data_create()
        obs.obs_data_set_string(settings, "text", combined)
        obs.obs_source_update(source, settings)
        obs.obs_data_release(settings)
        obs.obs_source_release(source)
    end
end

function script_defaults(settings)
    obs.obs_data_set_default_string(settings, "separator", " | ")
end