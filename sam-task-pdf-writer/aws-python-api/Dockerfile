FROM ubuntu:xenial-20170710

RUN rm -rf /var/lib/apt/lists/*
RUN apt-get -yq update && \
    apt-get -yq install apt-transport-https

RUN apt-get -yq install software-properties-common
RUN apt-get -yq install wget
WORKDIR /
RUN wget https://www.python.org/ftp/python/3.8.12/Python-3.8.12.tgz
RUN tar zxvf Python-3.8.12.tgz

# RUN add-apt-repository -y ppa:george-edison55/cmake-3.x
# RUN add-apt-repository -y ppa:deadsnakes/ppa
RUN apt-get -yq update
RUN apt-get -yq install build-essential

RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections
# RUN pip3 install -U pip

RUN apt-get -yq install gcc libprotobuf-dev protobuf-compiler autoconf wget curl libtool libtool-bin
RUN wget https://github.com/Kitware/CMake/releases/download/v3.20.5/cmake-3.20.5-Linux-x86_64.sh \
    -q -O /tmp/cmake-install.sh \
    && chmod u+x /tmp/cmake-install.sh \
    && mkdir /usr/bin/cmake \
    && /tmp/cmake-install.sh --skip-license --prefix=/usr/bin/cmake \
    && rm /tmp/cmake-install.sh

ENV PATH="/usr/bin/cmake/bin:${PATH}"

WORKDIR /Python-3.8.12
RUN apt-get -yq install libncurses-dev libgdbm-dev libz-dev tk-dev libsqlite3-dev libreadline-dev liblzma-dev libffi-dev libssl-dev
RUN ./configure --prefix=/python3.8
RUN make -j
RUN make install
ENV PATH="/python3.8/bin:${PATH}"

RUN apt-get -yq install libfontconfig wkhtmltopdf xvfb libpq-dev ttf-mscorefonts-installer fonts-takao-pgothic
# COPY binaries/cpdf/cpdf /usr/bin/
# RUN chmod +x /usr/bin/cpdf

# COPY static/fonts/SourceSansPro/ttf/* /usr/share/fonts/

COPY static/fonts/Inconsolata/* /usr/share/fonts/
COPY static/fonts/Sarabun/* /usr/share/fonts/
COPY static/fonts/CourierNew/* /usr/share/fonts/
COPY static/fonts/IRANSans/* /usr/share/fonts/
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
COPY binaries /usr/src/app/binaries/
COPY static /usr/src/app/static/
COPY templates /usr/src/app/templates/
COPY handler.py /usr/src/app/handler.py
COPY handler_s3.py /usr/src/app/handler_s3.py
COPY settings.py /usr/src/app/settings.py
COPY util.py /usr/src/app/util.py
WORKDIR /usr/src/app

COPY cred.json /usr/src/app/cred.json
COPY secret.py /usr/src/app/secret.py

# ENTRYPOINT ["/root/docker-entrypoint.sh"]
RUN chmod +x /python3.8/bin/python3.8
ENTRYPOINT [ "/python3.8/bin/python3.8", "-m", "awslambdaric" ]
CMD ["handler.hello"]
