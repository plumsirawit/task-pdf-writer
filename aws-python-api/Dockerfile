FROM ubuntu:xenial-20170710

RUN rm -rf /var/lib/apt/lists/*
RUN apt-get -yq update && \
  apt-get -yq install apt-transport-https

RUN apt-get -yq install software-properties-common
RUN add-apt-repository -y ppa:george-edison55/cmake-3.x
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get -yq update

RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections
RUN apt-get -yq install python3.8 python3.8-distutils libfontconfig wkhtmltopdf xvfb \
  libpq-dev ttf-mscorefonts-installer fonts-takao-pgothic
# RUN pip3 install -U pip

RUN apt-get -yq install gcc libprotobuf-dev protobuf-compiler autoconf wget curl libtool libtool-bin
RUN wget https://github.com/Kitware/CMake/releases/download/v3.20.5/cmake-3.20.5-Linux-x86_64.sh \
  -q -O /tmp/cmake-install.sh \
  && chmod u+x /tmp/cmake-install.sh \
  && mkdir /usr/bin/cmake \
  && /tmp/cmake-install.sh --skip-license --prefix=/usr/bin/cmake \
  && rm /tmp/cmake-install.sh

ENV PATH="/usr/bin/cmake/bin:${PATH}"

# COPY binaries/cpdf/cpdf /usr/bin/
# RUN chmod +x /usr/bin/cpdf

COPY static/fonts/SourceSansPro/ttf/* /usr/share/fonts/
COPY static/fonts/Thai/* /usr/share/fonts/
COPY static/fonts/Taiwan/* /usr/share/fonts/

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3.8 get-pip.py

COPY requirements.txt /root/requirements.txt
RUN python3.8 -m pip install -r /root/requirements.txt
RUN python3.8 -m pip install awslambdaric

# COPY docker-entrypoint.sh /root/docker-entrypoint.sh
# RUN chmod +x /root/docker-entrypoint.sh
COPY binaries/cpdf/cpdf /usr/bin/
RUN chmod +x /usr/bin/cpdf

RUN mkdir /usr/src/app
COPY binaries /usr/src/app/binaries
COPY static /usr/src/app/static
COPY templates /usr/src/app/templates
COPY handler.py /usr/src/app/handler.py
COPY settings.py /usr/src/app/settings.py
WORKDIR /usr/src/app

# ENTRYPOINT ["/root/docker-entrypoint.sh"]
ENTRYPOINT [ "python3.8", "-m", "awslambdaric" ]
CMD ["handler.hello"]