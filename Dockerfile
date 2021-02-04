FROM jekyll/jekyll:latest

WORKDIR /w

RUN touch /w/Gemfile.lock && chmod a+w /w/Gemfile.lock

ADD Gemfile ./
RUN bundle

WORKDIR /blog