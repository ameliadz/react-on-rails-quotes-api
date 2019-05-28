[![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)](https://generalassemb.ly)

# Rails as an API

### Learning Objectives

- Create a REST-ful API in Rails
- Give our API CRUD functionality with ActiveRecord
- Connect our Rails backend with a React frontend
- Make Tess Quotes app with RAILS!!!

# Part One: Making a Rails API

We've talked some about the different flags we can append to `rails new`. Today we'll be using: `--api`.

The api flag does a couple of things:

- Configures your application to start with a more limited set of middleware than normal. Specifically, it will not include any middleware primarily useful for browser applications (like cookies support) by default.
- Makes ApplicationController inherit from [ActionController::API](http://api.rubyonrails.org/classes/ActionController/API.html) instead of [ActionController::Base](http://api.rubyonrails.org/classes/ActionController/Base.html). As with middleware, this will leave out any Action Controller modules that provide functionalities primarily used by browser applications.
- Configures the generators to skip generating views, helpers and assets when you generate a new resource.

**Reference:** Rails Guides, [Using Rails for API-only Applications](http://edgeguides.rubyonrails.org/api_app.html)

### Create a new Rails application

Create a new project:

```bash
$ rails new rails_quotes_api --api --database=postgresql -JSTCMG --skip-turbolinks --skip-coffee --skip-active-storage --skip-bootsnap
$ cd rails_quotes_api

# -J don’t generate JavaScript
# -S don’t setup Sprockets (an asset pipeline for pre-processing and minifying front end code such as CSS and JavaScript: see guide here)
# -C don’t setup Action Cable (for using web sockets: see guide here)
# -M don’t setup Action Mailer (used for composing and sending emails: see guide here)
# -T means without Test::Unit (maybe you prefer to use rspec instead)
# -G means without .gitignore file
# -d postgresql means using the postgres database vs -d mysql
# --skip-turbolinks is intended to speed up navigating between pages of your application. It works by intercepting all link clicks that would navigate to a page within the app, and instead makes the request via AJAX, replacing the body with the received content
# --skip-active-storage Active Storage facilitates uploading files to a cloud storage service like Amazon S3 or Google Cloud Storage and attaching those files to Active Record objects
# --skip-bootsnap a tool by Shopify that speeds up loading Ruby and YAML files, resulting in 2 to 4 times faster cold start
```

Set up an empty database:

```
$ rails db:create
```
Open the project in the current directory using your text editor (in this case it's Sublime Text):

```
$ subl .
```
Start the server and open up the project in the browser, `localhost:3000`:

```
$ rails server
```

### Generate Model

Create a Quote model with `author`, `content` and `category` attributes as well as the optional parameters.

```bash
$ rails g model quote author:string content:text category:string

# run the migration to update the database with this change
$ rails db:migrate
```

**Remember:** in Rails, models are singlular and capitalized. Controllers and routes are plural and lowercase.

Before running the migration, check the `db/migrate/[timestamp]_create_quotes.rb` folder to make sure the migration is accurate:

```ruby
class CreateQuotes < ActiveRecord::Migration[5.2]
  def change
    create_table :quotes do |t|
      t.string :author
      t.text :content
      t.string :category

      t.timestamps
    end
  end
end
```
Navigate to the `app/models/Quote.rb` file:

```ruby
class Quote < ApplicationRecord
end
```
Then, once you've run the migration, check the schema file:

```ruby
  create_table "quotes", force: :cascade do |t|
    t.string "author"
    t.text "content"
    t.string "category"    
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
```

Now, step into the Rails console to create a new Quote:

```
$ rails c

# create a new quote object
>> Quote.new
=> #<Quote id: nil, author: nil, content: nil, category: nil, created_at: nil, updated_at: nil>
```

Now that you know it works, add some seed data to the `db/seeds.rb` file. In the Terminal (not inside rails console!), run `rails db:seed`. **Note:** the seed file will also run every time you run `rails db:reset` to reset your database.

```bash
$ rails db:seed
```

Open up a new *tab* in your terminal and run `rails c` (short for `rails console`) see all the seeded data in the database.

### Add Resource

Remember, tehe router is the air traffic controller of our application. This means, when you enter a URL into your browser window, the rails router will know which controller and action to handle your URL.

In the `config/routes.rb` file, add the following resource:

```rb
resources :quotes
```

### Create Controller

For now, let's just do the `index` and `show` methods -- since we haven't made a frontend, we'll just be visiting URLs and getting JSON. Create a new file in your controllers folder called `quotes_controller.rb`. Add a `QuotesController` class that inherits from the `ApplicationController`:

<details>
<summary>Here is the QuotesController:</summary>

```ruby
class QuotesController < ApplicationController
  def index
    @quotes = Quote.all
    render json: @quotes, status: :ok
  end

  def show
    begin
      @quote = Quote.find(params[:id])
      render json: @quote, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { message: "no quote matches that ID" }, status: :not_found
    rescue Exception
      render json: { message: "there was some other error" }, status: :internal_server_error
    end
  end

end
```
</details>

### SIDEBAR: Error handling!

You may notice that the `show` method has some error handling built in. It's using a `begin`, `rescue`, (`ensure`), `end` block. Here's how that works:

```rb
begin
  # try to do this thing
rescue NameOfError
  # if there's an error that has this name, do this thing
rescue Exception
  # catch other errors. doing this actually isn't
  # super recommended -- it's better to see exactly what
  # errors you might get and handle them specifically.
ensure
  # anything after ensure will always be done, no matter how
  # many errors happen.
end
```

[Here's a blog post about it.](http://vaidehijoshi.github.io/blog/2015/08/25/unlocking-ruby-keywords-begin-end-ensure-rescue/)

Something similar exists in JavaScript: the `try`/`catch`/`finally` syntax.

```js
try {
  // tryCode - Block of code to try
} catch (err) {
  // catchCode - Block of code to handle errors
} finally {
  // finallyCode - Block of code to be executed
  // regardless of the try / catch result
}
```

[Here's a link to the MDN docs.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

## 🚀 Independent Exercise: Superheroes API

Create a Superheroes API based on the fake data provided. For the most part, you'll be able to just follow the steps above, but you'll have to set up the columns in your database table in a particular way for the seed to work.

- `rails g model superhero name:string date_of_birth:string power:string`


# Part 2: Hooking Rails up to React!

Since we aren't using views anymore, we need something else to handle the front end interface. What's better than using React? (Nothing. React is the **best**.)

Setting Rails up to work with React is a multi-step process -- similar to setting it up with Express, but there's a couple extra things we need to do, some extra tools, so on and so forth.

### Create a React App

Just like in Express, the React app in a React/Rails setup should be generated with `create-react-app`. (Note: There are a couple of gems like `react-rails` and `react-on-rails`. **DO NOT USE THEM. THEY ARE NOT WORTH IT.**)

In the root directory of the Rails app, type `create-react-app client`.

### Running the React app and the Rails app at the same time

There's a pretty cool gem called [Foreman](https://github.com/ddollar/foreman) that allows us to run both the rails app and the react app simultaneously. **Note:** Ruby users should take care not to install foreman in their project's Gemfile.

Here are the steps to set it up:

- `gem install foreman`
- `touch Procfile` (a Procfile is something that allows you to declare multiple processes that should be running for your app. It's actually really interesting, and has to do with the Unix process model. For more information, check out [Process Types and the Procfile](https://devcenter.heroku.com/articles/procfile) and [The Process Model](https://devcenter.heroku.com/articles/process-model)).
- In the Procfile, we have to declare what our two processes are going to be. Add these two lines:

```
web: cd client && npm start
api: bundle exec rails s -p 4567
```

Now, to start the server, the command you'll use is **`foreman start -p 3000`**. 

Both the Rails server and the React server will start.

### Getting the React app to talk to the Rails app

In `package.json` in our client directory, we have to make the same change as we did for Express: adding the line `"proxy": "http://localhost:4567",`.

Now, we can make fetch requests from the frontend to the backend using axios (make sure you are in the root of the `client/` folder before running the following command):

```
$ npm install axios 
```

Let's do this with the Quotes App we've been doing so far.

<details>
<summary>A very simple <code>App.js</code></summary>

```
import React, { Component } from 'react';
import axios from 'axios'
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      apiData: null,
      apiDataLoaded: false,
    };
  }

  componentDidMount = async () => {
    const quotes = await axios.get('http://localhost:4567/quotes');
    const apiData = quotes.data;
  }
  
  

  showQuotesOnPage() {
    return this.state.apiData.map((quote) => {
      return (
        <div className="quote" key={quote.id}>
          <p className="content">{quote.content}</p>
          <span className="author">{quote.author}</span>
          <span className="category">{quote.category}</span>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="App">
        <div>
          {(this.state.apiDataLoaded) ? this.showQuotesOnPage() : <p>Loading...</p>}
        </div>
      </div>
    );
  }
}

export default App;
```
</details>

## Preventing CORS Issues
When you build APIs will Rails, chances are you might encounter some Cross-Origin errors. This is because your Rails API is not equipped to accept POST, PUT or DELETE requests from sources (or "origins") other than itself. The [Rack Middleware for handlisg CORS](https://github.com/cyu/rack-cors) gem is a useful tool in tackling that problem. Add the following to your Gemfile:

```
gem 'rack-cors', :require => 'rack/cors'
```

Next, head to the `application.rb` file in your `config` folder and, inside the Application class, add the following:

```
config.middleware.use Rack::Cors do
  allow do
    origins '*'
    resource '*', :headers => :any, :methods => [:get, :post, :put, :options, :delete], :credentials => false
  end
end
```
 
This should allow a client app to make requests without issue.

## 🚀 You Do: Superheroes App. cont'd.

Follow the steps above to create a React frontend for the Superheroes lab. All it needs to do is list the superheroes on the page.

# Part 3: API with CRUD

We learned how to do CRUD with Rails views. Now, let's do it with React.

### Create

In order to write the `create` method, we need to do a couple of things:

- format our `axios` request properly
- check the params to make sure they're correct & what we expect
- add the submitted quote to the database
- send back a message saying the quote has been added to the database & also send back all of the quotes

### Update

The steps for this will be about the same as the ones for create.

- Find quote that needs editing
- Check params
- Update & save quote
- Send back message & all quotes

### Delete

- Find quote by ID
- Delete it
- Send back all quotes
