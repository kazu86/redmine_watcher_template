# redmine_watcher_template

# Overview
"redmine_watcher_template" is a utility to ease adding/removing watchers on Redmine.

![new_issue](https://user-images.githubusercontent.com/97892812/151662841-115217f0-af39-4f9f-88fd-07b7021c4a12.gif)

# Setting
1. Template Registration(Mandatory)

* Register user ids want to handle.
Label:any string but it must be unique.Label duplication is not allowed.
IdList:commma separeted integer(e.g. "1,2,3")
![template_registration](https://user-images.githubusercontent.com/97892812/152646760-50326012-3179-481f-bf3c-4fac8ea2e20f.gif)

2. Template Update/Delete(Optional)

* Select target template.Then,you can delete or update it.
* "del all" button removes all the templates.
![update_delete](https://user-images.githubusercontent.com/97892812/152646864-c7f7019b-7cad-4ae2-aa4e-49b9a46390f5.png)

3. Display Order(Optional)

* Adjust display order using arrow buttons.
If ready, press "apply" button.
![display_order](https://user-images.githubusercontent.com/97892812/152646932-07989163-5ae2-449f-84cd-66e233250094.gif)

4. Setting Export/Import(Optional)

* You can export all the templates as an encoded json file.
This file can be imported.
These functions will be useful when you replace PC.
![export_import](https://user-images.githubusercontent.com/97892812/152646423-14ffe468-cdc5-4453-8eca-1187c5bdd1a4.png)

# Usage
* New issue
![new_issue](https://user-images.githubusercontent.com/97892812/151662843-f6dddf69-7766-4735-8c65-87db412d7825.gif)

* Existing issue
![existing_issue](https://user-images.githubusercontent.com/97892812/151662841-115217f0-af39-4f9f-88fd-07b7021c4a12.gif)

# Limitations
This extension is mainly intended for Redmine 3.x.x.
From Redmine 4.2.0, it is possible to specify a group as watcher.
However, this extension does not support groups.
Except for this, you can use the same as Redmine 3.x.x.
