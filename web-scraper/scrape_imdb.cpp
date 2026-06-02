#include <iostream>
#include <string>
#include <cstring>
#include <curl/curl.h>
#include "gumbo.h"

// This callback function is used by libcurl for storing fetched content into a string.
static size_t WriteCallback(void *contents, size_t size, size_t nmemb, std::string *userp) {
    userp->append((char*)contents, size * nmemb); // Appends the data fetched by libcurl to userp string.
    return size * nmemb; // Returns the number of bytes actually taken care of.
}

// This recursive function searches for and prints movie titles from the IMDb Top Chart page.
void search_for_titles(GumboNode* node) {
    if (node->type != GUMBO_NODE_ELEMENT) { // Base case: If the node is not an element, return.
        return;
    }

    GumboAttribute* href; // Variable to hold the href attribute of an <a> tag.
    // If the current node is an <a> tag and it has an href attribute.
    if (node->v.element.tag == GUMBO_TAG_A &&
        (href = gumbo_get_attribute(&node->v.element.attributes, "href"))) {
        std::string href_val = href->value;
        // Check if the href value contains the IMDb title identifier.
        if (href_val.find("/title/tt") != std::string::npos) {
            // Loop over all children of the <a> tag.
            GumboVector* children = &node->v.element.children;
            for (unsigned int i = 0; i < children->length; ++i) {
                GumboNode* child = static_cast<GumboNode*>(children->data[i]);
                // If the child is an <h3> tag, it's the movie title.
                if (child->type == GUMBO_NODE_ELEMENT && 
                    child->v.element.tag == GUMBO_TAG_H3) {
                    // Get the text node inside the <h3> tag.
                    GumboNode* title_text_node = static_cast<GumboNode*>(child->v.element.children.data[0]);
                    // If the text node is of type TEXT, print its content.
                    if (title_text_node->type == GUMBO_NODE_TEXT) {
                        std::cout << title_text_node->v.text.text << std::endl;
                    }
                }
            }
        }
    }

    // Recursively call search_for_titles on all children of the current node.
    GumboVector* children = &node->v.element.children;
    for (unsigned int i = 0; i < children->length; ++i) {
        search_for_titles(static_cast<GumboNode*>(children->data[i]));
    }
}

// The main function where execution starts.
int main(void) {
    CURL *curl; // Pointer to a CURL object.
    CURLcode res; // Variable to store the result of CURL operations.
    std::string readBuffer; // String to store the content fetched by CURL.

    // Initialize CURL.
    curl = curl_easy_init();
    if(curl) {
        // Set the URL from where to fetch the content.
        curl_easy_setopt(curl, CURLOPT_URL, "https://www.imdb.com/chart/top/");
        // Set the function to be called back for writing fetched data.
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        // Set the custom pointer to pass to the WriteCallback function.
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
        // Perform the CURL request.
        res = curl_easy_perform(curl);
        // Clean up the CURL object.
        curl_easy_cleanup(curl);

        // Parse the HTML content with Gumbo.
        GumboOutput* output = gumbo_parse(readBuffer.c_str());
        // Search for and print movie titles.
        search_for_titles(output->root); 
        // Free the memory allocated for the Gumbo parse tree.
        gumbo_destroy_output(&kGumboDefaultOptions, output);
    }
    return 0;
}
