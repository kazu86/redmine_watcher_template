# redmine_watcher_template

# Overview
"redmine_watcher_template" is a utility to ease adding/removing watchers on Redmine.<br>

![new_issue](https://user-images.githubusercontent.com/97892812/151662841-115217f0-af39-4f9f-88fd-07b7021c4a12.gif)

# Usage
1. Template Registration
* Register user ids want to handle.<br>
Label:any string but it must be unique.Label duplication is not allowed.<br>
IdList:commma separeted integer(e.g. "1,2,3")<br>
![template_registration](https://user-images.githubusercontent.com/97892812/151662844-60e19420-347b-4b1f-902e-1eab992d130b.gif)

2. Add/Remove watcher.

* New issue<br>
![new_issue](https://user-images.githubusercontent.com/97892812/151662843-f6dddf69-7766-4735-8c65-87db412d7825.gif)

* Existing issue<br>
![existing_issue](https://user-images.githubusercontent.com/97892812/151662841-115217f0-af39-4f9f-88fd-07b7021c4a12.gif)

# Limitations
This extension is mainly intended for Redmine 3.x.x.<br>
From Redmine 4.2.0, it is possible to specify a group as watcher.<br>
However, this extension does not support groups.<br>
Except for this, you can use the same as Redmine 3.x.x.<br>
