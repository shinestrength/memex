function View()
{
  this.msnry = null;
  this.overlay = null;
  this.container = null;
  this.grid = null;
  this.menu = null;
  var parent = this;
    
  const SETTINGS = {
    STATSNUMTAGS: 5,
    STATSNUMTYPE: 10,
    WIDEGRIDITEM: true,
    USEMASONRY: true,
    GRIDITEMIDBASE: 'item',
    SHOWUPPER: true,
    SHOWTITLE: true,
    SHOWAUTH: true,
    SHOWTYPE: true,
    SHOWLINK: true,
    SHOWLOWER: true,
    SHOWTAGS: true,
    SHOWPROJ: true,
    SHOWNOTE: true,
    SHOWQOTE: true,
    SHOWTERM: true,
    SHOWPROG: true,
    SHOWIMAG: true,
    SHOWFILE: true,
    SHOWOVERLAY: true
  }

  this.install = function()
  {
    this.overlay = document.getElementById("overlay");
    this.container = document.getElementById("container");
    this.grid = document.getElementById("grid");
    this.menu = document.getElementById("menu");

    if (SETTINGS.USEMASONRY)
    {
      this.msnry = new Masonry('.grid', 
      {
        itemSelector: '.griditem',
        columnWidth: 350,
        gutter: 20,
        fitWidth: true,
        transitionDuration: 0,
      });
    }
  }

  this.display = function(db)
  {
    if (window.showAdd !== undefined && window.showAdd)
    {
      main.add.setOverlay(false);
    }

    // BUILD
    let dbKeys = Object.keys(db);
    let i = 0;
    let contentHtml = '';
    while (i < dbKeys.length) 
    {
      contentHtml += this.buildEntry(db, dbKeys[i]);
      i++;
    }
    this.grid.innerHTML = contentHtml;

    // LAYOUT
    if (SETTINGS.USEMASONRY)
    {
      this.msnry.reloadItems();
      this.msnry.layout();
    }

    let imgLoad = imagesLoaded( container );
    // When all images finish: redo mansonry layout
    imgLoad.on( 'progress', function() { parent.msnry.layout(); } );
  }

  this.buildEntry = function(db, key)
  {
    let value = db[key];
    let itemClass = "griditem";
    if (SETTINGS.WIDEGRIDITEM)
    {
      if (this.isDefined(value.WIDE) && value.WIDE)
      {
        itemClass += " griditem-wide";
      }
      else if (this.isDefined(value.QOTE))
      {
        if (Array.isArray(value.QOTE) && value.QOTE.length > 4)
        {
          itemClass += " griditem-wide";
        } 
      }
    }

    if (SETTINGS.SHOWIMAG && this.isDefined(value.TYP) && value.TYPE === 'image')
    {
      itemClass += " griditem-image";
    }

    let entry = ``;

    // ITEM DIV
    entry += `<div class="${itemClass}" id="${SETTINGS.GRIDITEMIDBASE + value.DIID}">`;
    if (this.isDefined(value.LINK))
    {
      var idUrl = "url";
      if (this.isDefined(value.SEEN) && value.SEEN === "true")
      {
        idUrl = "urlseen";
      }

      // LINK START
      if (SETTINGS.SHOWLINK && !this.isObject(value.LINK))
      {
        // If this item has only one link then make the whole title the link
        entry += `<a class="griditem-link" href="${String(value.LINK)}" id="${idUrl}">`;
      }
    }

    // UPPER CONTENT START
    if (SETTINGS.SHOWUPPER)
    {
      entry += `<div class="griditem-containerupper">`;

      // TITLE
      if (SETTINGS.SHOWTITLE)
      {
        entry += `<div class="griditem-title">${key.to_properCase()}</div>`;
      }

      // LINK END
      if (SETTINGS.SHOWLINK && this.isDefined(value.LINK))
      {
        if (this.isObject(value.LINK))
        {
          for (let l = 0; l < value.LINK.length; l++)
          {
            entry += `<a class="griditem-link" href="${String(value.LINK[l])}" id="${idUrl}">`;
            entry += `<div class="griditem-linkcontainer"><i class="griditem-linkicon fas fa-link"></i><div class="griditem-linktitle">${this.extractRootDomain(value.LINK[l])}</div></div></a>`;
          }
        }
        else
        {
          entry += `<div class="griditem-linkcontainer"><i class="griditem-linkicon fas fa-link"></i><div class="griditem-linktitle">${this.extractRootDomain(value.LINK)}</div></div></a>`;
        }
      }

      // TYPE
      if (SETTINGS.SHOWTYPE && this.isDefined(value.TYPE))
      {

        entry += `<div class="griditem-typecontainer">`;
        for (let tc = 0; tc < value.TYPE.length; tc++)
        {
          const icon = getTypeIconName(value.TYPE[tc]);
          entry += `<a class="griditem-type" href='#type-${value.TYPE[tc]}'>`;
          entry += `<i class="griditem-typeicon ${icon}"></i>`;
          entry += `</a>`;
        }
        entry += `</div>`; // griditem-typecontainer
      }

      // UPPER CONTENT END
      entry += `</div>`;
    }

    // LOWER CONTENT START
    if (SETTINGS.SHOWLOWER)
    {
      entry += `<div class="griditem-containerlower">`;

      // AUTHOR
      if (SETTINGS.SHOWAUTH && this.isDefined(value.AUTH))
      {
        entry += `<div class="griditem-auth"><i class="fas fa-user textIcon"></i>${value.AUTH}</div>`;
      }

      // TAGS
      if (SETTINGS.SHOWTAGS && this.isDefined(value.TAGS))
      {
        entry += `<div class="griditem-tags"><i class="fas fa-tag textIcon"></i>`;
        for (var i = 0; i < value.TAGS.length; i++)
        {
          entry += `<a class="griditem-taglink" href="#tag-${value.TAGS[i]}">${value.TAGS[i]}</a>`;
          if (i+1 !== value.TAGS.length)
          {
            entry += `, `;
          }
        };
        entry += `</div>`;
      }

      // PROJECT
      if (SETTINGS.SHOWPROJ && this.isDefined(value.PROJ))
      {
        entry += `<div class="griditem-proj"><i class="fas fa-leaf textIcon"></i>`;
        for (var i = 0; i < value.PROJ.length; i++)
        {
          entry += `<a class="griditem-taglink" href="#proj-${value.PROJ[i]}">${value.PROJ[i].to_properCase()}</a>`;
          if (i + 1 != value.PROJ.length)
          {
            entry += `, `;
          }
        }
        entry += `</div>`;
      }

      // TERM
      if (SETTINGS.SHOWTERM && this.isDefined(value.TERM))
      {
        entry += this.doMultilineFormatting(value.TERM, "griditem-term", "fas fa-ribbon textIcon");
      }

      // NOTE
      if (SETTINGS.SHOWNOTE && this.isDefined(value.NOTE))
      {
        entry += this.doMultilineFormatting(value.NOTE, "griditem-note", "fas fa-sticky-note textIcon");
      }

      // QUOTE
      if (SETTINGS.SHOWQOTE && this.isDefined(value.QOTE))
      {
        entry += this.doMultilineFormatting(value.QOTE, "griditem-quote", "fas fa-comment textIcon");
      }

      // TERM
      if (SETTINGS.SHOWTERM && this.isDefined(value.TERM))
      {
        entry += this.doMultilineFormatting(value.TERM, "griditem-term", "fas fa-ribbon textIcon");
      }

      // PROGRESS
      if (SETTINGS.SHOWPROG && this.isDefined(value.PROG))
      {
        entry += `<div class="griditem-prog"><i class="fas fa-clock textIcon"></i>${value.PROG}</div>`;
      }

      // FILE
      if (SETTINGS.SHOWFILE && this.isDefined(value.FILE))
      {
        if (this.isObject(value.FILE))
        {
          for (var i = 0; i < value.FILE.length; i++) 
          {
            entry += `<div class="griditem-file"><i class="fas fa-folder-open textIcon"></i><a class="griditem-file-link" href="content/media/${value.FILE[i]}">${value.FILE[i]}</a></div>`;
          }
        }
        else
        {
          // single
          entry += `<div class="griditem-file"><i class="fas fa-folder-open textIcon"></i><a class="griditem-file-link" href="content/media/${value.FILE}">${value.FILE}</a></div>`;
        }
      }

      // LOWER CONTENT END
      entry += `</div>`;
    }

    // IMAGE
    if (SETTINGS.SHOWIMAG && this.isDefined(value.TYPE) 
      && value.TYPE === 'image' && this.isDefined(value.FILE))
    {
      entry += `<div class="image">`;
      if (SETTINGS.SHOWOVERLAY)
      {
        entry += `<div class="image-overlay"></div>`;
      }
      entry += `<img class="griditem-image-img" src="content/media/${value.FILE}">`;
      entry += `</div>`;
    }

    entry += `</div>`;
    return entry;
  }

  this.stats = function(value)
  {
    let menuContent = ``;
    if (window.showAdd !== undefined && window.showAdd)
    {
      // ADD
      menuContent += `<div class="menu-itemgroup">`;
      menuContent += `<a href='#add' class="menu-item">`;
      menuContent += `<b>a</b>dd`;
      menuContent += `</a>`;
      menuContent += `</div>`;
    }

    // TOTAL
    menuContent += `<div class="menu-itemgroup">`;
    menuContent += `<a href='#' class="menu-item">`;
    menuContent += `<div class="menu-itemcount">${value.total}</div>`;
    menuContent += `<i class="menu-itemicon fas fa-asterisk"></i>`;
    menuContent += `</a>`;
    menuContent += `</div>`;

    // DONE
    menuContent += `<div class="menu-itemgroup">`;
    menuContent += `<a href='#done-true' class="menu-item">`;
    menuContent += `<div class="menu-itemcount">${value.done}</div>`;
    menuContent += `<i class="menu-itemicon fas fa-check"></i>`;
    menuContent += `</a>`;
    menuContent += `<a href='#done-false' class="menu-item">`;
    menuContent += `<div class="menu-itemcount">${value.total - value.done}</div>`;
    menuContent += `<i class="menu-itemicon fas fa-times"></i>`;
    menuContent += `</a>`;
    menuContent += `</div>`;
    
    menuContent += `<div class="menu-itemgroup">`;
    for (let ty = 0; ty < Math.min(value.types.length, SETTINGS.STATSNUMTYPE); ty++) 
    {
      const type = value.types[ty][0];
      const count = value.types[ty][1];
      const icon = getTypeIconName(type);
      menuContent += `<a href='#type-${type}' class="menu-item">`;
      menuContent += `<div class="menu-itemcount">${count}</div>`;
      menuContent += `<i class="menu-itemicon ${icon}"></i>`;
      menuContent += `</a>`;
    }
    menuContent += `</div>`;

    // TERM
    menuContent += `<div class="menu-itemgroup">`;
    if (value.terms > 0)
    {
      // menuContent += `<div class="menu-item-space"></div>`;
      menuContent += `<a href='#term' class="menu-item">`;
      menuContent += `<div class="menu-itemcount">${value.terms}</div>`;
      menuContent += `<i class="menu-itemicon fas fa-ribbon"></i>`;
      menuContent += `</a>`;
    }
    menuContent += `</div>`;

    // TAGS
    menuContent += `<div class="menu-itemgroup">`;
    if (value.tags.length > 0)
    {
      menuContent += `<div class="menu-tagcontainer">`;
      menuContent += `<i class="menu-tagicon fas fa-tag"></i>`;
      for (var t = 0; t < Math.min(value.types.length, SETTINGS.STATSNUMTAGS); t++) 
      {
        menuContent += `<a class="menu-tag" href='#tag-${value.tags[t][0]}'>`;
        // menuContent += `<i class="fas fa-tag textIcon"></i>`;
        menuContent += `<div class="menu-tagcount">${value.tags[t][1]}</div>`;
        menuContent += `<div class="menu-taglabel">${value.tags[t][0]}</div>`;
        menuContent += `</a>`;
      }
      menuContent += `</div>`;
    }
    menuContent += `</div>`;
    this.menu.innerHTML = menuContent;
  }

  this.doMultilineFormatting = function(data, className, iconName)
  {
    let result = '';
    if (Array.isArray(data))
    {
      for (var i in data)
      {
        if (data[i].substring(0, 2) == "> ")
        {
          // New item
          if (data[i].includes(": "))
          {
            let titleSplit = data[i].substring(2).split(': '); // .substring(2) removes the "> "
            for (var e = 0; e < titleSplit.length; e++) 
            {
              titleSplit[e] = titleSplit[e].trim();
            }
            result += `<div class="${className}"><i class="${iconName}"></i><b>${titleSplit[0]}</b>: ${titleSplit[1]}</div>`;
          }
          else
          {
            result += `<div class="${className}"><i class="${iconName}"></i>${data[i].substring(2)}</div>`;
          }
        }
        else if (data[i].substring(0, 2) === "& ")
        {
          // New line in current item
          result += `<div class="${className}">${data[i].substring(2)}</div>`;
        }
        else if (data[i].substring(0, 2) == "- ")
        {
          // Bullet point
          result += `<div class="${className}"><i class="fas fa-caret-right textIcon"></i>${data[i].substring(2)}</div>`;
        }
        else
        {
          // Handle unformatted
          result += `<div class="${className}"><i class="${iconName}"></i>${data[i]}</div>`;
        }
      }
    }
    else
    {
      // Handle not array
      result += `<div class="${className}"><i class="${iconName}"></i>${data}</div>`;
    }
    return result;
  }

  getTypeIconName = function(type)
  {
    let icon = '';
    switch (type) 
    {
        case 'article': icon = 'far fa-newspaper'; break;
        case 'podcast': icon = 'fas fa-podcast'; break;
        case 'video': icon = 'fas fa-tv'; break;
        case 'list': icon = 'fas fa-file-alt'; break;
        case 'book': icon = 'fas fa-book-open'; break;
        case 'game': icon = 'fas fa-gamepad'; break;
        case 'service': icon = 'fas fa-server'; break;
        case 'lecture': icon = 'fas fa-chalkboard-teacher'; break;
        case 'quote': icon = 'fas fa-comment'; break;
        case 'tool': icon = 'fas fa-wrench'; break;
        case 'music': icon = 'fas fa-music'; break;
        case 'image': icon = 'fas fa-image'; break;
        case 'encyclopedia': icon = 'fas fa-globe'; break;
        case 'term': icon = 'fas fa-ribbon'; break;
      }
    return icon;
  }

  // GENERAL HELPER
  this.isDefined = function(value)
  {
    return (typeof value !== 'undefined');
  }

  this.isObject = function(value)
  {
    return (typeof value == 'object');
  }

  String.prototype.to_properCase = function()
  {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  // Source: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  this.extractRootDomain = function(url)
  {
    var domain = this.extractHostname(url),
    splitArr = domain.split('.'),
    arrLen = splitArr.length;

    // extracting the root domain here
    // if there is a subdomain 
    if (arrLen > 2) 
    {
      domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
      // check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
      if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2)
      {
        // this is using a ccTLD
        domain = splitArr[arrLen - 3] + '.' + domain;
      }
    }
    return domain;
  }

  // Source: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  this.extractHostname = function(url)
  {
    var hostname;
    // find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1)
    {
      hostname = url.split('/')[2];
    }
    else
    {
      hostname = url.split('/')[0];
    }

    // find & remove port number
    hostname = hostname.split(':')[0];
    // find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
  }
}
