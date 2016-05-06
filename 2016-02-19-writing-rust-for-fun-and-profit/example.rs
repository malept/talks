enum GreetingType {
    Friendly,
    Unfriendly,
}

fn greeting(greeting_type: GreetingType) -> String {
    match greeting_type {
        GreetingType::Friendly => "friend",
        GreetingType::Unfriendly => "jerk",
    }.to_owned()
}

fn main() {
  let chosen_greeting = greeting(GreetingType::Friendly);
  println!("Hello, {}!", chosen_greeting)
}
