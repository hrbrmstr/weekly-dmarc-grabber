library(igraph, include.only = c("graph_from_data_frame", "degree", "V", "V<-"))
library(urltools, include.only = "suffix_extract")
library(stringi, include.only = "stri_match_first_regex")
library(jsonlite, include.only = "fromJSON")
library(d3r, include.only = "d3_igraph")
library(tidyverse)

apex_domain <- function(fqdn) {
  .x <- suffix_extract(fqdn)[, c("domain", "suffix")]
  sprintf("%s.%s", .x$domain, .x$suffix)
}

latest_run <- readLines("latest", warn = FALSE)
output_file <- "docs/processors.json"

fils <- list.files(latest_run, full.names = TRUE)

fils %>% 
  map(fromJSON) %>% 
  map_df(~{
    tibble(
      domain = .x$domain,
      valid = .x$dmarc$valid,
      p = .x$dmarc$tags$p$value %||% NA_character_,
      rua = list(.x$dmarc$tags$rua$value),
      ruf = list(.x$dmarc$tags$ruf$value)
    )
  }) -> dmarc

dmarc %>% 
  filter(!is.na(p)) %>% 
  filter(lengths(rua) > 0) %>% 
  select(-ruf) %>% 
  filter(
    map_lgl(rua, inherits, "character")
  ) %>% 
  unnest("rua") %>% 
  mutate(
    scheme = "mailto",
    address = sub("^mailto:", "", rua),
    size_limit = NA
  ) %>% 
  select(-rua) %>% 
  bind_rows(
    dmarc %>% 
      filter(!is.na(p)) %>% 
      filter(lengths(rua) > 0) %>% 
      select(-ruf) %>% 
      filter(
        map_lgl(rua, inherits, "data.frame")
      ) %>% 
      unnest(rua)
  ) %>% 
  select(-size_limit, -valid) %>% 
  separate_rows(address, sep = ",") %>% 
  mutate(
    address = sub("^mailto:", "", address),
    to = stri_match_first_regex(address, "^([^@]+)@")[,2],
    apex = apex_domain(stri_match_first_regex(address, "^[^@]+@(.*)$")[,2])
  ) -> has_valid_dmarc

has_valid_dmarc %>% 
  distinct(domain, p, apex) -> gdf

gdf %>% 
  select(from = domain, to = apex) %>% 
  graph_from_data_frame() -> g

V(g)$in_degree <- degree(g, mode = "in")
V(g)$color <- ifelse(V(g)$in_degree > 1, "goldenrod", "maroon")

writeLines(d3_igraph(g), output_file)
