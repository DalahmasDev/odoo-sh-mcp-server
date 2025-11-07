# Odoo Custom App Development Guide

## Overview

This guide demonstrates how to build custom Odoo applications using the Odoo.sh MCP Server's Git workflow tools. AI agents can create, modify, and deploy Odoo modules directly to Odoo.sh.

## Prerequisites

- Odoo.sh MCP Server configured and running
- SSH access to your Odoo.sh project
- Basic understanding of Odoo module structure
- AI assistant with MCP client (Warp, Claude Desktop, Cline, etc.)

## Development Workflow

### 1. Check Current State

Before starting development, check the project status:

```
AI: "Check my Odoo project status"
```

The agent will:
- Get project info with `get_project_info`
- Check current branch with `get_current_branch`
- Show git status with `git_status`
- List existing files with `list_files`

### 2. Create Module Structure

#### Basic Module Structure

An Odoo module requires:
```
my_module/
├── __init__.py          # Python package init
├── __manifest__.py      # Module metadata
├── models/              # Python models
│   ├── __init__.py
│   └── my_model.py
├── views/               # XML views
│   └── my_views.xml
├── security/            # Access control
│   └── ir.model.access.csv
└── static/              # Static assets (optional)
    └── description/
        └── icon.png
```

#### Creating the Structure

```
AI: "Create a new Odoo module called 'library_management' for managing books"
```

The agent will:
1. `create_directory library_management`
2. `create_directory library_management/models`
3. `create_directory library_management/views`
4. `create_directory library_management/security`
5. Create all necessary files with `write_file`

### 3. Write Module Files

#### __manifest__.py

```python
{
    'name': 'Library Management',
    'version': '17.0.1.0.0',
    'category': 'Tools',
    'summary': 'Manage library books and borrowers',
    'description': """
Library Management System
========================
This module allows you to:
* Manage books
* Track borrowers
* Monitor due dates
    """,
    'author': 'Your Name',
    'website': 'https://www.example.com',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/book_views.xml',
        'views/menu_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
```

#### models/book.py

```python
from odoo import models, fields, api

class Book(models.Model):
    _name = 'library.book'
    _description = 'Library Book'
    _order = 'title'

    name = fields.Char(string='Title', required=True)
    isbn = fields.Char(string='ISBN', copy=False)
    author = fields.Char(string='Author', required=True)
    publisher = fields.Char(string='Publisher')
    published_date = fields.Date(string='Published Date')
    pages = fields.Integer(string='Number of Pages')
    category_id = fields.Many2one('library.category', string='Category')
    state = fields.Selection([
        ('available', 'Available'),
        ('borrowed', 'Borrowed'),
        ('maintenance', 'Maintenance'),
    ], string='Status', default='available')
    
    @api.constrains('pages')
    def _check_pages(self):
        for record in self:
            if record.pages < 0:
                raise ValidationError('Pages cannot be negative')
```

#### views/book_views.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Form View -->
    <record id="view_library_book_form" model="ir.ui.view">
        <field name="name">library.book.form</field>
        <field name="model">library.book</field>
        <field name="arch" type="xml">
            <form>
                <sheet>
                    <group>
                        <group>
                            <field name="name"/>
                            <field name="isbn"/>
                            <field name="author"/>
                        </group>
                        <group>
                            <field name="publisher"/>
                            <field name="published_date"/>
                            <field name="pages"/>
                            <field name="category_id"/>
                            <field name="state"/>
                        </group>
                    </group>
                </sheet>
            </form>
        </field>
    </record>

    <!-- Tree View -->
    <record id="view_library_book_tree" model="ir.ui.view">
        <field name="name">library.book.tree</field>
        <field name="model">library.book</field>
        <field name="arch" type="xml">
            <tree>
                <field name="name"/>
                <field name="author"/>
                <field name="isbn"/>
                <field name="state"/>
            </tree>
        </field>
    </record>

    <!-- Search View -->
    <record id="view_library_book_search" model="ir.ui.view">
        <field name="name">library.book.search</field>
        <field name="model">library.book</field>
        <field name="arch" type="xml">
            <search>
                <field name="name"/>
                <field name="author"/>
                <field name="isbn"/>
                <filter name="available" string="Available"
                        domain="[('state', '=', 'available')]"/>
                <filter name="borrowed" string="Borrowed"
                        domain="[('state', '=', 'borrowed')]"/>
            </search>
        </field>
    </record>

    <!-- Action -->
    <record id="action_library_book" model="ir.actions.act_window">
        <field name="name">Books</field>
        <field name="res_model">library.book</field>
        <field name="view_mode">tree,form</field>
    </record>

    <!-- Menu -->
    <menuitem id="menu_library_root"
              name="Library"
              sequence="10"/>
    <menuitem id="menu_library_book"
              name="Books"
              parent="menu_library_root"
              action="action_library_book"
              sequence="10"/>
</odoo>
```

#### security/ir.model.access.csv

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_library_book_user,library.book user,model_library_book,base.group_user,1,1,1,0
access_library_book_manager,library.book manager,model_library_book,base.group_system,1,1,1,1
```

### 4. Stage, Commit, and Push

```
AI: "Commit and push the library management module"
```

The agent will:
1. `git_status` - Check what files were created
2. `git_add [files]` - Stage all module files
3. `git_commit "Add library management module"` - Commit with message
4. `git_push` - Push to trigger Odoo.sh build

### 5. Monitor Build

```
AI: "Check the build status for my last commit"
```

The agent will:
1. `get_build_history` - Show recent commits
2. `get_logs` - Show Odoo installation logs
3. Report any errors or success

### 6. Iterative Development

#### Adding a New Field

```
AI: "Add a 'cover_image' field to the Book model"
```

The agent will:
1. `read_file models/book.py` - Read current model
2. Modify Python code to add field
3. `write_file models/book.py` - Update file
4. `read_file views/book_views.xml` - Read current view
5. Modify XML to add field to form
6. `write_file views/book_views.xml` - Update view
7. `git_add`, `git_commit`, `git_push` - Deploy changes

#### Adding a Related Model

```
AI: "Create a Borrower model that can borrow books"
```

The agent will:
1. Create `models/borrower.py` with Many2many to books
2. Create `views/borrower_views.xml`
3. Update `__manifest__.py` to include new files
4. Update `security/ir.model.access.csv`
5. Commit and push

## Best Practices

### 1. Module Naming

- Use lowercase with underscores: `my_custom_module`
- Prefix with company name for uniqueness: `acme_inventory`
- Be descriptive but concise

### 2. File Organization

```
my_module/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── model1.py
│   ├── model2.py
├── views/
│   ├── model1_views.xml
│   ├── model2_views.xml
│   └── menu_views.xml
├── security/
│   ├── ir.model.access.csv
│   └── security_groups.xml
├── data/
│   └── initial_data.xml
├── static/
│   └── description/
│       ├── icon.png
│       └── index.html
└── tests/
    ├── __init__.py
    └── test_model1.py
```

### 3. Version Control

- **Commit often**: After each logical unit of work
- **Descriptive messages**: "Add book borrowing feature" not "Update files"
- **Test before push**: Use `git_status` to review changes
- **Branch management**: Create feature branches for major changes

### 4. Development Cycle

1. **Plan**: Define module requirements
2. **Create**: Build module structure and files
3. **Test locally**: If possible, test in local Odoo instance
4. **Commit**: Stage and commit changes
5. **Push**: Deploy to Odoo.sh
6. **Monitor**: Check build logs
7. **Iterate**: Fix issues, add features

### 5. Error Handling

When builds fail:

```
AI: "The build failed. Check the logs and fix the error"
```

The agent will:
1. `get_logs` with more lines
2. Identify Python/XML syntax errors
3. Fix the problematic file
4. Commit and push again

### 6. Rollback

To revert changes:

```
AI: "Revert the last commit"
```

The agent will:
1. Use git commands to revert
2. Push the revert commit

## Common Tasks

### Create a Simple Module

```
AI: "Create a simple todo list module with just a name and done checkbox"
```

### Add a Computed Field

```
AI: "Add a computed field 'full_name' to combine first_name and last_name"
```

### Add a Button Action

```
AI: "Add a 'Mark as Borrowed' button to the Book form"
```

### Create a Wizard

```
AI: "Create a wizard for bulk book checkout"
```

### Add a Report

```
AI: "Create a PDF report showing all borrowed books"
```

### Inherit Existing Model

```
AI: "Extend res.partner to add a library_member_id field"
```

## Troubleshooting

### Module Not Appearing

If module doesn't show in Odoo:
1. Check `__manifest__.py` has `'installable': True`
2. Verify all files are committed and pushed
3. Check build logs for installation errors
4. Update apps list in Odoo (Settings → Apps → Update Apps List)

### Import Errors

Python import errors:
1. Check `__init__.py` files exist in all directories
2. Verify imports in `__init__.py` match file names
3. Check for circular imports

### Access Rights Issues

If users can't access module:
1. Check `security/ir.model.access.csv` is complete
2. Verify CSV includes group permissions
3. Check `__manifest__.py` includes security file

### Build Timeout

If build takes too long:
1. Check for heavy dependencies
2. Review initialization code
3. Check for large data files

## Advanced Workflows

### Feature Branch Development

```
AI: "Create a feature branch called 'add-borrower-model' and implement the borrower tracking feature"
```

Agent workflow:
1. `git_checkout add-borrower-model --createNew`
2. Implement feature with multiple commits
3. `git_push add-borrower-model`
4. Merge to main after testing

### Multi-Module Development

```
AI: "Create two related modules: 'library_core' and 'library_reports'"
```

### Module Dependencies

```
AI: "My module depends on 'account' and 'sale'. Update the manifest"
```

### Database Operations

```
AI: "Execute an Odoo shell command to check how many books are in the database"
```

Uses `execute_odoo_shell` tool:
```python
env['library.book'].search_count([])
```

## Resources

- [Odoo Documentation](https://www.odoo.com/documentation/17.0/)
- [Odoo.sh Documentation](https://www.odoo.sh/doc)
- [Odoo Development Tutorials](https://www.odoo.com/documentation/17.0/developer.html)
- This MCP Server: `docs/Runbook.md` for setup and operations

## Summary

The Odoo.sh MCP Server enables AI agents to:
- ✅ Create complete Odoo modules from scratch
- ✅ Modify existing modules with surgical precision
- ✅ Handle the full Git workflow automatically
- ✅ Monitor builds and troubleshoot errors
- ✅ Iterate rapidly on features

This makes custom Odoo development as simple as describing what you want to the AI assistant.
